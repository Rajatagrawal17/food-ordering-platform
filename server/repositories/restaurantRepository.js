import { Restaurant } from '../models/Restaurant.js';

export const restaurantRepository = {
  create: (payload) => Restaurant.create(payload),
  findById: (id) => Restaurant.findById(id),
  updateById: (id, payload) => Restaurant.findByIdAndUpdate(id, payload, { new: true }),
  deleteById: (id) => Restaurant.findByIdAndDelete(id),
  count: (filter = {}) => Restaurant.countDocuments(filter),
  findMany: ({ filter, page, limit, sort }) =>
    Restaurant.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sort),
};
