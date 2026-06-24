import { getRedisClient } from '../config/redis.js';

export const refreshTokenRepository = {
  create: async (payload) => {
    const client = getRedisClient();
    const key = `session:${payload.token}`;
    const userKey = `user:sessions:${payload.user.toString()}`;
    const ttl = Math.max(0, Math.ceil((new Date(payload.expiresAt).getTime() - Date.now()) / 1000)) || 2592000;

    await client.set(key, JSON.stringify({
      user: payload.user.toString(),
      token: payload.token,
      expiresAt: payload.expiresAt,
    }), 'EX', ttl);

    await client.sadd(userKey, payload.token);
    await client.expire(userKey, ttl);
  },

  findByToken: async (token) => {
    const client = getRedisClient();
    const data = await client.get(`session:${token}`);
    if (!data) return null;
    const parsed = JSON.parse(data);
    return {
      user: parsed.user,
      token: parsed.token,
      expiresAt: new Date(parsed.expiresAt),
    };
  },

  deleteByToken: async (token) => {
    const client = getRedisClient();
    const data = await client.get(`session:${token}`);
    if (data) {
      const parsed = JSON.parse(data);
      const userKey = `user:sessions:${parsed.user}`;
      await client.srem(userKey, token);
      await client.del(`session:${token}`);
    }
  },

  deleteByUser: async (userId) => {
    const client = getRedisClient();
    const userKey = `user:sessions:${userId.toString()}`;
    const tokens = await client.smembers(userKey);
    if (tokens.length > 0) {
      const keys = tokens.map((token) => `session:${token}`);
      await client.del(...keys);
    }
    await client.del(userKey);
  },
};