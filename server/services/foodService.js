import { ApiError } from '../utils/ApiError.js';
import { buildPagination } from '../utils/pagination.js';
import { foodRepository } from '../repositories/foodRepository.js';

const buildFilter = (query) => {
  const filter = {};

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
      { category: { $regex: query.search, $options: 'i' } },
    ];
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.availability !== undefined) {
    filter.availability = query.availability === 'true';
  }

  if (query.restaurant) {
    filter.restaurant = query.restaurant;
  }

  return filter;
};

export const foodService = {
  list: async (query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 12;
    const filter = buildFilter(query);
    const total = await foodRepository.count(filter);
    const foods = await foodRepository.findMany({ filter, page, limit, sort: { createdAt: -1 } });

    return {
      foods,
      pagination: buildPagination({ page, limit, total }),
    };
  },
  getById: async (id) => {
    const food = await foodRepository.findById(id);

    if (!food) {
      throw new ApiError(404, 'Food item not found');
    }

    return food;
  },
  create: async (payload) => foodRepository.create(payload),
  update: async (id, payload) => {
    const food = await foodRepository.updateById(id, payload);

    if (!food) {
      throw new ApiError(404, 'Food item not found');
    }

    return food;
  },
  remove: async (id) => {
    const food = await foodRepository.deleteById(id);

    if (!food) {
      throw new ApiError(404, 'Food item not found');
    }

    return food;
  },
};