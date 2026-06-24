import httpClient from './httpClient';

export const cartApi = {
  getCart: async () => {
    const response = await httpClient.get('/cart');
    return response.data;
  },
  updateItem: async (payload) => {
    const response = await httpClient.put('/cart', payload);
    return response.data;
  },
  removeItem: async (itemId) => {
    const response = await httpClient.delete(`/cart/items/${itemId}`);
    return response.data;
  },
  clear: async () => {
    const response = await httpClient.delete('/cart');
    return response.data;
  },
};