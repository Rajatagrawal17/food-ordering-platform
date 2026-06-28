import jwt from 'jsonwebtoken';

const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;
const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';
const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '3650d'; // 10 years

const ensureSecrets = () => {
  if (!accessSecret || !refreshSecret) {
    throw new Error('JWT secrets are required');
  }
};

export const createAccessToken = (payload) => {
  ensureSecrets();
  return jwt.sign(payload, accessSecret, { expiresIn: accessExpiresIn });
};

export const createRefreshToken = (payload) => {
  ensureSecrets();
  return jwt.sign(payload, refreshSecret, { expiresIn: refreshExpiresIn });
};

export const verifyAccessToken = (token) => {
  ensureSecrets();
  return jwt.verify(token, accessSecret);
};

export const verifyRefreshToken = (token) => {
  ensureSecrets();
  return jwt.verify(token, refreshSecret);
};