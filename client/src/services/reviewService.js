import { reviewApi } from '../api/reviewApi';

export const reviewService = {
  featured: async () => {
    const response = await reviewApi.featured();
    return response.data.data;
  },
  listByFood: async (foodId) => {
    const response = await reviewApi.listByFood(foodId);
    return response.data.data;
  },
  create: async (payload) => {
    const response = await reviewApi.create(payload);
    return response.data.data;
  },
};