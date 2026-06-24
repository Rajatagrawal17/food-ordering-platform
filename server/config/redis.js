import Redis from 'ioredis';
import { logger } from './logger.js';

let redisClient = null;

export const getRedisClient = () => {
  if (redisClient) {
    return redisClient;
  }

  const redisUri = process.env.REDIS_URI ?? 'redis://127.0.0.1:6379';

  redisClient = new Redis(redisUri, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });

  redisClient.on('connect', () => {
    logger.info('Redis connecting...');
  });

  redisClient.on('ready', () => {
    logger.info('Redis connected and ready');
  });

  redisClient.on('error', (error) => {
    logger.error({ error }, 'Redis connection error');
  });

  return redisClient;
};
