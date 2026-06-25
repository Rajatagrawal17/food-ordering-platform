import Redis from 'ioredis';
import { logger } from './logger.js';

let redisClient = null;

export const getRedisClient = () => {
  if (redisClient) {
    return redisClient;
  }

  const redisUri = process.env.REDIS_URI ?? 'redis://127.0.0.1:6379';

  let cleanUri = redisUri.trim();
  if ((cleanUri.startsWith('"') && cleanUri.endsWith('"')) || (cleanUri.startsWith("'") && cleanUri.endsWith("'"))) {
    cleanUri = cleanUri.slice(1, -1);
  }

  try {
    const parsedUrl = new URL(cleanUri);

    logger.info({
      redis_diagnostics: {
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || '6379',
        usernamePresent: !!parsedUrl.username,
        passwordLength: parsedUrl.password ? parsedUrl.password.length : 0,
        tlsEnabled: parsedUrl.protocol === 'rediss:',
      }
    }, 'Redis connection diagnostics');

    const redisOptions = {
      host: parsedUrl.hostname,
      port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : 6379,
      username: parsedUrl.username ? decodeURIComponent(parsedUrl.username) : undefined,
      password: parsedUrl.password ? decodeURIComponent(parsedUrl.password) : undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      retryStrategy: (times) => {
        return Math.min(times * 500, 10000);
      },
    };

    if (parsedUrl.protocol === 'rediss:') {
      redisOptions.tls = {};
    }

    redisClient = new Redis(redisOptions);
  } catch (error) {
    logger.error({ error }, 'Failed to parse Redis connection URI or initialize Redis client');
    redisClient = new Redis(cleanUri, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      retryStrategy: (times) => {
        return Math.min(times * 500, 10000);
      },
    });
  }

  redisClient.on('connect', () => {
    logger.info('Redis connecting...');
  });

  redisClient.on('ready', () => {
    logger.info('Redis connected and ready');
  });

  let lastErrorLoggedTime = 0;
  redisClient.on('error', (error) => {
    const now = Date.now();
    if (now - lastErrorLoggedTime > 30000) {
      logger.error({ error }, 'Redis connection error');
      lastErrorLoggedTime = now;
    }
  });

  return redisClient;
};


