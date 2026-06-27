import httpClient from './httpClient';

export const restaurantApi = {
  list: async (params = {}) => {
    const response = await httpClient.get('/restaurants', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await httpClient.get(`/restaurants/${id}`);
    return response.data;
  },
  create: async (payload) => {
    const response = await httpClient.post('/restaurants', payload);
    return response.data;
  },
  update: async (id, payload) => {
    const response = await httpClient.patch(`/restaurants/${id}`, payload);
    return response.data;
  },
  remove: async (id) => {
    const response = await httpClient.delete(`/restaurants/${id}`);
    return response.data;
  },
};
