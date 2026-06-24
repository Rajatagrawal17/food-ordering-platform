import { getRedisClient } from '../config/redis.js';
import { logger } from '../config/logger.js';

export const cacheService = {
  get: async (key) => {
    try {
      const client = getRedisClient();
      const cached = await client.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.error({ error, key }, 'Cache get error');
      return null;
    }
  },

  set: async (key, value, ttl = 300) => {
    try {
      const client = getRedisClient();
      const stringified = JSON.stringify(value);
      await client.set(key, stringified, 'EX', ttl);
      return true;
    } catch (error) {
      logger.error({ error, key }, 'Cache set error');
      return false;
    }
  },

  del: async (key) => {
    try {
      const client = getRedisClient();
      await client.del(key);
      return true;
    } catch (error) {
      logger.error({ error, key }, 'Cache delete error');
      return false;
    }
  },

  delByPattern: async (pattern) => {
    try {
      const client = getRedisClient();
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
      return true;
    } catch (error) {
      logger.error({ error, pattern }, 'Cache delete by pattern error');
      return false;
    }
  },
};
