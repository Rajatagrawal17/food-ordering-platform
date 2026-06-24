import { Review } from '../models/Review.js';

export const reviewRepository = {
  create: (payload) => Review.create(payload),
  createMany: (items) => Review.insertMany(items),
  findByFood: (foodId) => Review.find({ food: foodId }).populate('user', 'name role').sort({ createdAt: -1 }),
  findFeatured: () => Review.find({ isFeatured: true }).populate('user', 'name role').populate('food', 'name image').sort({ createdAt: -1 }),
  count: (filter = {}) => Review.countDocuments(filter),
  deleteAll: () => Review.deleteMany({}),
};