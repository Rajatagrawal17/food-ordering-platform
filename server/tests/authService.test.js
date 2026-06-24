import { jest, expect, test, beforeEach } from '@jest/globals';

const findByEmail = jest.fn();
const findById = jest.fn();
const createUser = jest.fn();
const deleteByToken = jest.fn();
const createToken = jest.fn();

await jest.unstable_mockModule('../repositories/userRepository.js', () => ({
  userRepository: {
    findByEmail,
    findById,
    findByIdWithPassword: jest.fn(),
    create: createUser,
    updateById: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
}));

await jest.unstable_mockModule('../repositories/refreshTokenRepository.js', () => ({
  refreshTokenRepository: {
    create: createToken,
    findByToken: jest.fn(),
    deleteByToken,
    deleteByUser: jest.fn(),
  },
}));

await jest.unstable_mockModule('../utils/token.js', () => ({
  createAccessToken: jest.fn(() => 'access-token'),
  createRefreshToken: jest.fn(() => 'refresh-token'),
  verifyRefreshToken: jest.fn(() => ({ userId: 'user-1' })),
}));

await jest.unstable_mockModule('../utils/ApiError.js', () => ({
  ApiError: class ApiError extends Error {
    constructor(statusCode, message) {
      super(message);
      this.statusCode = statusCode;
    }
  },
}));

const { authService } = await import('../services/authService.js');

beforeEach(() => {
  jest.clearAllMocks();
});

test('registers a customer account and returns auth payload', async () => {
  findByEmail.mockResolvedValue(null);
  createUser.mockResolvedValue({ _id: 'user-1', name: 'Asha', email: 'asha@example.com', role: 'customer', password: 'hashed' });

  const result = await authService.register({ name: 'Asha', email: 'asha@example.com', password: 'Password123', phone: '9999999999' });

  expect(createUser).toHaveBeenCalledWith(expect.objectContaining({ role: 'customer' }));
  expect(result.accessToken).toBe('access-token');
  expect(result.user.email).toBe('asha@example.com');
});

test('rotates refresh tokens on refresh', async () => {
  const storedToken = { token: 'refresh-token' };
  findByEmail.mockResolvedValue({ _id: 'user-1', role: 'customer', toObject: () => ({ _id: 'user-1', role: 'customer', email: 'a@example.com' }) });
  findById.mockResolvedValue({ _id: 'user-1', role: 'customer', toObject: () => ({ _id: 'user-1', role: 'customer', email: 'a@example.com' }) });
  const refreshTokenRepository = (await import('../repositories/refreshTokenRepository.js')).refreshTokenRepository;
  refreshTokenRepository.findByToken = jest.fn().mockResolvedValue(storedToken);

  const result = await authService.refresh('refresh-token');

  expect(deleteByToken).toHaveBeenCalledWith('refresh-token');
  expect(result.refreshToken).toBe('refresh-token');
});