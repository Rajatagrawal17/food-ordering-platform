import { jest, expect, test, beforeEach } from '@jest/globals';

const count = jest.fn();
const findMany = jest.fn();
const findById = jest.fn();
const updateById = jest.fn();
const deleteById = jest.fn();

await jest.unstable_mockModule('../repositories/foodRepository.js', () => ({
  foodRepository: { count, findMany, findById, updateById, deleteById, create: jest.fn() },
}));

const { foodService } = await import('../services/foodService.js');

beforeEach(() => {
  jest.clearAllMocks();
});

test('lists foods with pagination metadata', async () => {
  count.mockResolvedValue(2);
  findMany.mockResolvedValue([{ _id: '1' }, { _id: '2' }]);

  const result = await foodService.list({ page: '1', limit: '12', search: 'pizza' });

  expect(count).toHaveBeenCalled();
  expect(result.foods).toHaveLength(2);
  expect(result.pagination.total).toBe(2);
});

test('returns food by id and throws for missing food', async () => {
  findById.mockResolvedValue({ _id: 'food-1', name: 'Pizza' });
  await expect(foodService.getById('food-1')).resolves.toMatchObject({ name: 'Pizza' });
});