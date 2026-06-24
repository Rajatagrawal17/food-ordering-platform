import { Category } from '../models/Category.js';

export const categoryRepository = {
  findMany: () => Category.find({ isActive: true }).sort({ name: 1 }),
  createMany: (items) => Category.insertMany(items),
  deleteAll: () => Category.deleteMany({}),
};