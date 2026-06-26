import { cartApi } from '../api/cartApi';

export const cartService = {
  getCart: async () => {
    const response = await cartApi.getCart();
    return response.data;
  },
  updateItem: async (payload) => {
    const response = await cartApi.updateItem(payload);
    return response.data;
  },
  removeItem: async (itemId) => {
    const response = await cartApi.removeItem(itemId);
    return response.data;
  },
  clear: async () => {
    const response = await cartApi.clear();
    return response.data;
  },
};