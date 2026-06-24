import { orderApi } from '../api/orderApi';

export const orderService = {
  checkout: async (payload) => {
    const response = await orderApi.checkout(payload);
    return response.data.data;
  },
  list: async (params) => {
    const response = await orderApi.list(params);
    return response.data.data;
  },
  getById: async (id) => {
    const response = await orderApi.getById(id);
    return response.data.data;
  },
  updateStatus: async (id, payload) => {
    const response = await orderApi.updateStatus(id, payload);
    return response.data.data;
  },
};