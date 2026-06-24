import httpClient from './httpClient';

export const foodApi = {
  list: async (params = {}) => {
    const response = await httpClient.get('/foods', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await httpClient.get(`/foods/${id}`);
    return response.data;
  },
  create: async (payload) => {
    const response = await httpClient.post('/foods', payload);
    return response.data;
  },
  update: async (id, payload) => {
    const response = await httpClient.patch(`/foods/${id}`, payload);
    return response.data;
  },
  remove: async (id) => {
    const response = await httpClient.delete(`/foods/${id}`);
    return response.data;
  },
};