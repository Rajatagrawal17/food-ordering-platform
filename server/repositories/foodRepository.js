import { Food } from '../models/Food.js';

export const foodRepository = {
  create: (payload) => Food.create(payload),
  findById: (id) => Food.findById(id),
  updateById: (id, payload) => Food.findByIdAndUpdate(id, payload, { new: true }),
  deleteById: (id) => Food.findByIdAndDelete(id),
  count: (filter = {}) => Food.countDocuments(filter),
  findMany: ({ filter, page, limit, sort }) =>
    Food.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sort),
};