import { jest } from '@jest/globals';

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/food_ordering_platform_test';
process.env.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'test-access-secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'test-refresh-secret';
process.env.CSRF_SECRET = process.env.CSRF_SECRET ?? 'test-csrf-secret';
process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID ?? 'rzp_test_key';
process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? 'rzp_test_secret';

// Mock ioredis globally in ESM tests
const mockRedisInstance = {
  on: jest.fn(),
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  keys: jest.fn().mockResolvedValue([]),
  rpush: jest.fn().mockResolvedValue(1),
  blpop: jest.fn().mockResolvedValue(null),
  ping: jest.fn().mockResolvedValue('PONG'),
  sadd: jest.fn().mockResolvedValue(1),
  srem: jest.fn().mockResolvedValue(1),
  smembers: jest.fn().mockResolvedValue([]),
  expire: jest.fn().mockResolvedValue(1),
  // Handle rate-limit-redis scripts and command executions case-insensitively
  call: jest.fn().mockImplementation((cmd, ..._args) => {
    const command = cmd.toLowerCase();
    if (command === 'script') {
      return Promise.resolve('fakesha123');
    }
    if (command === 'evalsha' || command === 'eval') {
      return Promise.resolve([1, Date.now() + 900000]);
    }
    return Promise.resolve('OK');
  }),
};

await jest.unstable_mockModule('ioredis', () => ({
  default: jest.fn().mockImplementation(() => mockRedisInstance),
}));
