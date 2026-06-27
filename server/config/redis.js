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
    // Bounded, not null: with maxRetriesPerRequest: null, ioredis queues
    // commands indefinitely while disconnected/reconnecting instead of
    // rejecting them, which means any `await cacheService.get(...)` (used
    // on every cached GET route, e.g. cacheMiddleware) can hang forever
    // during a Redis outage or slow reconnect — and since that's awaited
    // inside an Express request handler, the whole HTTP response hangs
    // with it, which is exactly what an infinite client-side loading
    // spinner looks like. A small bounded retry count means a command
    // fails fast (cacheService's try/catch already turns that into a
    // graceful null/false) instead of blocking the request indefinitely.
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    // Don't queue commands issued while disconnected; fail them immediately
    // so cacheService's try/catch can fall back to "no cache" right away
    // instead of waiting for a reconnect that may take many seconds.
    enableOfflineQueue: false,
    // Cap how long ioredis will wait for a command to come back before
    // treating it as failed, so a half-open connection can't silently
    // block a request forever even while nominally "connected".
    commandTimeout: 3000,
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



