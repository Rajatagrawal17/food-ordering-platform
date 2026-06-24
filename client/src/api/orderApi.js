import httpClient from './httpClient';

export const orderApi = {
  checkout: async (payload) => {
    const response = await httpClient.post('/orders', payload);
    return response.data;
  },
  list: async (params = {}) => {
    const response = await httpClient.get('/orders', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await httpClient.get(`/orders/${id}`);
    return response.data;
  },
  updateStatus: async (id, payload) => {
    const response = await httpClient.patch(`/orders/${id}/status`, payload);
    return response.data;
  },
};