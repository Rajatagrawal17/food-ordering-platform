import { foodApi } from '../api/foodApi';

export const foodService = {
  list: async (params) => {
    const response = await foodApi.list(params);
    return response.data;
  },
  getById: async (id) => {
    const response = await foodApi.getById(id);
    return response.data;
  },
  create: async (payload) => {
    const response = await foodApi.create(payload);
    return response.data;
  },
  update: async (id, payload) => {
    const response = await foodApi.update(id, payload);
    return response.data;
  },
  remove: async (id) => {
    const response = await foodApi.remove(id);
    return response.data;
  },
};