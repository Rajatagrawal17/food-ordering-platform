import httpClient from './httpClient';

export const wishlistApi = {
  getWishlist: async () => {
    const response = await httpClient.get('/wishlist');
    return response.data;
  },
  addFood: async (foodId) => {
    const response = await httpClient.post('/wishlist', { foodId });
    return response.data;
  },
  removeFood: async (foodId) => {
    const response = await httpClient.delete(`/wishlist/${foodId}`);
    return response.data;
  },
};
