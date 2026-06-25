import Redis from 'ioredis';
import { logger } from './logger.js';

let redisClient = null;

export const getRedisClient = () => {
  if (redisClient) {
    return redisClient;
  }

  const redisUri = process.env.REDIS_URI ?? 'redis://127.0.0.1:6379';

  const cleanUri = redisUri.trim().replace(/^['"]|['"]$/g, '');

  let protocol = 'redis:';
  let host = '127.0.0.1';
  let port = 6379;
  let username = '';
  let password = '';

  try {
    const protocolSplit = cleanUri.split('://');
    if (protocolSplit.length > 1) {
      protocol = protocolSplit[0] + ':';
      const rest = protocolSplit[1];
      const atSplit = rest.lastIndexOf('@');
      if (atSplit !== -1) {
        const credentials = rest.substring(0, atSplit);
        const hostPort = rest.substring(atSplit + 1);

        const colonIndex = credentials.indexOf(':');
        if (colonIndex !== -1) {
          username = credentials.substring(0, colonIndex);
          password = credentials.substring(colonIndex + 1);
        } else {
          username = credentials;
        }

        const hostPortSplit = hostPort.split(':');
        host = hostPortSplit[0];
        if (hostPortSplit.length > 1) {
          port = parseInt(hostPortSplit[1], 10);
        }
      } else {
        const hostPortSplit = rest.split(':');
        host = hostPortSplit[0];
        if (hostPortSplit.length > 1) {
          port = parseInt(hostPortSplit[1], 10);
        }
      }
    }
  } catch (err) {
    logger.error({ err }, 'Failed to parse Redis URI manually');
  }

  try {
    if (username) username = decodeURIComponent(username);
    if (password) password = decodeURIComponent(password);
  } catch (err) {
    logger.error({ err }, 'Failed to decode credentials');
  }

  const pwdLength = password.length;

  logger.info({
    redis_diagnostics: {
      protocol,
      hostname: host,
      port,
      usernamePresent: !!username,
      passwordLength: pwdLength,
      tlsEnabled: protocol === 'rediss:',
    }
  }, 'Redis connection diagnostics');

  if (password === '********') {
    logger.error('REDIS_URI secret on Render contains the literal mask ******** instead of the real Upstash secret. Please replace it with the actual password in the Render environment settings.');
  }

  const redisOptions = {
    host,
    port,
    username: username || undefined,
    password: password || undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    retryStrategy: (times) => {
      return Math.min(times * 500, 10000);
    },
  };

  if (protocol === 'rediss:') {
    redisOptions.tls = {};
  }

  redisClient = new Redis(redisOptions);

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



