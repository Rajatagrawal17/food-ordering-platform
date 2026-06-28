import { asyncHandler } from '../utils/asyncHandler.js';
import { authService } from '../services/authService.js';

const sendAuthResponse = (res, payload, statusCode) => {

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
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken;
  const payload = await authService.refresh(refreshToken);

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
  const result = await authService.forgotPassword(email);

  res.status(200).json({
    success: true,
    message: 'Password reset link sent to your email',
    data: result,
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