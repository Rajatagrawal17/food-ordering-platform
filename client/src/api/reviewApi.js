import httpClient from './httpClient';

export const reviewApi = {
  featured: async () => {
    const response = await httpClient.get('/reviews/featured');
    return response.data;
  },
  listByFood: async (foodId) => {
    const response = await httpClient.get(`/reviews/food/${foodId}`);
    return response.data;
  },
  create: async (payload) => {
    const response = await httpClient.post('/reviews', payload);
    return response.data;
  },
};