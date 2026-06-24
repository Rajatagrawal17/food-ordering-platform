import { jest, expect, test, beforeEach } from '@jest/globals';
import { cacheService } from '../services/cacheService.js';
import { getRedisClient } from '../config/redis.js';

// We import ioredis mock (from setupEnv.js)
const redisClient = getRedisClient();

beforeEach(() => {
  jest.clearAllMocks();
});

test('cacheService.get returns parsed JSON from Redis', async () => {
  redisClient.get.mockResolvedValue(JSON.stringify({ success: true, count: 42 }));
  
  const result = await cacheService.get('test-key');
  
  expect(redisClient.get).toHaveBeenCalledWith('test-key');
  expect(result).toEqual({ success: true, count: 42 });
});

test('cacheService.set stringifies and stores value in Redis with TTL', async () => {
  redisClient.set.mockResolvedValue('OK');
  
  const result = await cacheService.set('test-key', { count: 42 }, 120);
  
  expect(redisClient.set).toHaveBeenCalledWith('test-key', JSON.stringify({ count: 42 }), 'EX', 120);
  expect(result).toBe(true);
});

test('cacheService.del deletes key in Redis', async () => {
  redisClient.del.mockResolvedValue(1);
  
  const result = await cacheService.del('test-key');
  
  expect(redisClient.del).toHaveBeenCalledWith('test-key');
  expect(result).toBe(true);
});
