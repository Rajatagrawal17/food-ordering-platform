import { jest, expect, test, beforeEach } from '@jest/globals';

const create = jest.fn();
const findByFood = jest.fn();
const findFeatured = jest.fn();
const findById = jest.fn();

await jest.unstable_mockModule('../repositories/reviewRepository.js', () => ({
  reviewRepository: { create, createMany: jest.fn(), findByFood, findFeatured, count: jest.fn(), deleteAll: jest.fn() },
}));

await jest.unstable_mockModule('../repositories/foodRepository.js', () => ({
  foodRepository: { findById },
}));

const { reviewService } = await import('../services/reviewService.js');

beforeEach(() => {
  jest.clearAllMocks();
});

test('creates a review for a valid food item', async () => {
  findById.mockResolvedValue({ _id: 'food-1' });
  create.mockResolvedValue({ _id: 'review-1', rating: 5 });

  const result = await reviewService.create('user-1', { foodId: 'food-1', rating: 5, comment: 'Great' });

  expect(create).toHaveBeenCalledWith(expect.objectContaining({ food: 'food-1', rating: 5 }));
  expect(result._id).toBe('review-1');
});