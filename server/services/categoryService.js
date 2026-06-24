import { categoryRepository } from '../repositories/categoryRepository.js';

export const categoryService = {
  list: async () => categoryRepository.findMany(),
};