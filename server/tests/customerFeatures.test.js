import { jest, describe, expect, test, beforeEach } from '@jest/globals';

const findWishlistByUser = jest.fn();
const addWishlistFood = jest.fn();
const removeWishlistFood = jest.fn();
const findCouponByCode = jest.fn();
const findUserById = jest.fn();
const updateUserById = jest.fn();
const findNotificationsByUser = jest.fn();
const markNotificationRead = jest.fn();

await jest.unstable_mockModule('../repositories/wishlistRepository.js', () => ({
  wishlistRepository: {
    findByUser: findWishlistByUser,
    create: jest.fn(),
    addFood: addWishlistFood,
    removeFood: removeWishlistFood,
  },
}));

await jest.unstable_mockModule('../repositories/foodRepository.js', () => ({
  foodRepository: {
    findById: jest.fn((id) => Promise.resolve({ _id: id, name: 'Burger', price: 100 })),
  },
}));

await jest.unstable_mockModule('../repositories/couponRepository.js', () => ({
  couponRepository: {
    findByCode: findCouponByCode,
    create: jest.fn(),
  },
}));

await jest.unstable_mockModule('../repositories/userRepository.js', () => ({
  userRepository: {
    findById: findUserById,
    updateById: updateUserById,
  },
}));

await jest.unstable_mockModule('../repositories/notificationRepository.js', () => ({
  notificationRepository: {
    findByUser: findNotificationsByUser,
    markAsRead: markNotificationRead,
    markAllAsRead: jest.fn(),
  },
}));

await jest.unstable_mockModule('../utils/ApiError.js', () => ({
  ApiError: class ApiError extends Error {
    constructor(statusCode, message) {
      super(message);
      this.statusCode = statusCode;
    }
  },
}));

const { getWishlist } = await import('../controllers/wishlistController.js');
const { validateCoupon } = await import('../controllers/couponController.js');
const { updateProfile } = await import('../controllers/profileController.js');

describe('Customer Features Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getWishlist retrieves user wishlist', async () => {
    const req = { user: { _id: 'user-1' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    findWishlistByUser.mockResolvedValue({ user: 'user-1', foods: [] });

    await getWishlist(req, res);

    expect(findWishlistByUser).toHaveBeenCalledWith('user-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test('validateCoupon returns discount calculations', async () => {
    const req = { body: { code: 'SAVE10', amount: 100 } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    findCouponByCode.mockResolvedValue({
      code: 'SAVE10',
      discountType: 'percentage',
      discountValue: 10,
      expirationDate: new Date(Date.now() + 86400000),
      usedCount: 0,
      usageLimit: 10,
    });

    await validateCoupon(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          discount: 10,
          finalAmount: 90,
        }),
      })
    );
  });

  test('updateProfile updates user info', async () => {
    const req = { user: { _id: 'user-1' }, body: { name: 'New Name', phone: '9999999999' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    updateUserById.mockResolvedValue({ _id: 'user-1', name: 'New Name', phone: '9999999999' });

    await updateProfile(req, res);

    expect(updateUserById).toHaveBeenCalledWith('user-1', { name: 'New Name', phone: '9999999999' });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
