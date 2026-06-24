import { cacheService } from '../services/cacheService.js';

export const cacheMiddleware = (ttl = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;
    const cachedResponse = await cacheService.get(key);

    if (cachedResponse) {
      return res.status(200).json(cachedResponse);
    }

    const originalJson = res.json;

    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300 && body && body.success) {
        cacheService.set(key, body, ttl);
      }
      return originalJson.call(this, body);
    };

    next();
  };
};

export const clearCache = (pattern) => {
  return async (req, res, next) => {
    await cacheService.delByPattern(pattern);
    next();
  };
};
