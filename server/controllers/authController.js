import { asyncHandler } from '../utils/asyncHandler.js';
import { authService } from '../services/authService.js';

const isProduction = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
};

const sendAuthResponse = (res, payload, statusCode) => {
  res.cookie('refreshToken', payload.refreshToken, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(statusCode).json({
    success: true,
    data: {
      user: payload.user,
      accessToken: payload.accessToken,
    },
  });
};

export const register = asyncHandler(async (req, res) => {
  const payload = await authService.register(req.body);
  sendAuthResponse(res, payload, 201);
});

export const login = asyncHandler(async (req, res) => {
  const payload = await authService.login(req.body);
  sendAuthResponse(res, payload, 200);
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  res.clearCookie('refreshToken', cookieOptions);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken ?? req.body.refreshToken;
  const payload = await authService.refresh(refreshToken);

  res.cookie('refreshToken', payload.refreshToken, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    data: {
      user: payload.user,
      accessToken: payload.accessToken,
    },
  });
});

export const me = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await authService.forgotPassword(email);

  res.status(200).json({
    success: true,
    message: 'Password reset link sent to your email',
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
  });
});