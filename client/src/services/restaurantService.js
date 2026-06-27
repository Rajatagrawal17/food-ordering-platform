import { restaurantApi } from '../api/restaurantApi';

export const restaurantService = {
  list: async (params) => {
    const response = await restaurantApi.list(params);
    return response.data;
  },
  getById: async (id) => {
    const response = await restaurantApi.getById(id);
    return response.data;
  },
  create: async (payload) => {
    const response = await restaurantApi.create(payload);
    return response.data;
  },
  update: async (id, payload) => {
    const response = await restaurantApi.update(id, payload);
    return response.data;
  },
  remove: async (id) => {
    const response = await restaurantApi.remove(id);
    return response.data;
  },
};
