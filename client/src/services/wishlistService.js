import { wishlistApi } from '../api/wishlistApi';

export const wishlistService = {
  getWishlist: async () => {
    const response = await wishlistApi.getWishlist();
    return response.data;
  },
  addFood: async (foodId) => {
    const response = await wishlistApi.addFood(foodId);
    return response.data;
  },
  removeFood: async (foodId) => {
    const response = await wishlistApi.removeFood(foodId);
    return response.data;
  },
};
