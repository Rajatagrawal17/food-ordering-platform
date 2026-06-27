import { logger } from '../config/logger.js';

export const errorHandler = (error, req, res, _next) => {
  const statusCode = error.statusCode ?? 500;
  const message = error.message ?? 'Internal server error';

  logger.error({ error, path: req.path, method: req.method }, 'Request handler error');

  res.status(statusCode).json({
    success: false,
    message,
  });
};
