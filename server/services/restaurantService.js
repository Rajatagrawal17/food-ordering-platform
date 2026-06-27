import { ApiError } from '../utils/ApiError.js';
import { buildPagination } from '../utils/pagination.js';
import { restaurantRepository } from '../repositories/restaurantRepository.js';

const buildFilter = (query) => {
  const filter = {};

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
    ];
  }

  if (query.cuisine) {
    // Matches if the cuisines array contains the query cuisine (case-insensitive)
    filter.cuisines = { $regex: new RegExp(`^${query.cuisine}$`, 'i') };
  }

  if (query.city) {
    filter['address.city'] = { $regex: new RegExp(`^${query.city}$`, 'i') };
  }

  return filter;
};

export const restaurantService = {
  list: async (query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 12;
    const filter = buildFilter(query);
    const total = await restaurantRepository.count(filter);
    const restaurants = await restaurantRepository.findMany({ filter, page, limit, sort: { createdAt: -1 } });

    return {
      restaurants,
      pagination: buildPagination({ page, limit, total }),
    };
  },
  getById: async (id) => {
    const restaurant = await restaurantRepository.findById(id);

    if (!restaurant) {
      throw new ApiError(404, 'Restaurant not found');
    }

    return restaurant;
  },
  create: async (payload) => restaurantRepository.create(payload),
  update: async (id, payload) => {
    const restaurant = await restaurantRepository.updateById(id, payload);

    if (!restaurant) {
      throw new ApiError(404, 'Restaurant not found');
    }

    return restaurant;
  },
  remove: async (id) => {
    const restaurant = await restaurantRepository.deleteById(id);

    if (!restaurant) {
      throw new ApiError(404, 'Restaurant not found');
    }

    return restaurant;
  },
};
