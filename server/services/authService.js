import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { ApiError } from '../utils/ApiError.js';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../utils/token.js';
import { refreshTokenRepository } from '../repositories/refreshTokenRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { getRedisClient } from '../config/redis.js';
import { backgroundQueue } from '../utils/queue.js';

const toPublicUser = (user) => {
  const plainUser = user.toObject ? user.toObject() : user;
  delete plainUser.password;
  return plainUser;
};

const buildAuthResponse = async (user) => {
  const payload = { userId: user._id.toString(), role: user.role };
  const accessToken = createAccessToken(payload);
  const refreshToken = createRefreshToken(payload);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await refreshTokenRepository.create({
    user: user._id,
    token: refreshToken,
    expiresAt,
  });

  return {
    accessToken,
    refreshToken,
    user: toPublicUser(user),
  };
};

export const authService = {
  register: async (input) => {
    const existingUser = await userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new ApiError(409, 'Email already in use');
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      phone: input.phone,
      role: 'customer',
      isActive: true,
    });

    await backgroundQueue.addJob('email:welcome', { userId: user._id.toString() });

    return buildAuthResponse(user);
  },
  login: async ({ email, password }) => {
    const user = await userRepository.findByEmail(email).select('+password');

    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    return buildAuthResponse(user);
  },
  logout: async (refreshToken) => {
    await refreshTokenRepository.deleteByToken(refreshToken);
  },
  refresh: async (refreshToken) => {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const storedToken = await refreshTokenRepository.findByToken(refreshToken);

    if (!storedToken) {
      if (payload && payload.userId) {
        await refreshTokenRepository.deleteByUser(payload.userId);
      }
      throw new ApiError(401, 'Session revoked due to token reuse detection');
    }

    const user = await userRepository.findById(payload.userId);

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    await refreshTokenRepository.deleteByToken(refreshToken);
    return buildAuthResponse(user);
  },
  forgotPassword: async (email) => {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const client = getRedisClient();
    if (client.status && client.status !== 'ready') {
      throw new ApiError(503, 'Password reset service is temporarily unavailable');
    }

    const token = crypto.randomBytes(32).toString('hex');
    await client.set(`password-reset:${token}`, user._id.toString(), 'EX', 3600);

    const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
    const resetUrl = `${clientOrigin}/reset-password/${token}`;

    await backgroundQueue.addJob('email:password-reset', {
      email: user.email,
      name: user.name,
      resetUrl,
    });

    const isMockMode = !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS;
    return isMockMode ? { resetUrl, isMockMode: true } : { isMockMode: false };
  },
  resetPassword: async (token, newPassword) => {
    const client = getRedisClient();
    if (client.status && client.status !== 'ready') {
      throw new ApiError(503, 'Password reset service is temporarily unavailable');
    }

    const userId = await client.get(`password-reset:${token}`);

    if (!userId) {
      throw new ApiError(400, 'Invalid or expired password reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await userRepository.updateById(userId, { password: hashedPassword });
    await client.del(`password-reset:${token}`);

    return true;
  },
};