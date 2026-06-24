import { adminApi } from '../api/adminApi';

export const adminService = {
  overview: async () => {
    const response = await adminApi.overview();
    return response.data.data;
  },
  users: async (params) => {
    const response = await adminApi.users(params);
    return response.data.data;
  },
  orders: async (params) => {
    const response = await adminApi.orders(params);
    return response.data.data;
  },
  analytics: async () => {
    const response = await adminApi.analytics();
    return response.data.data;
  },
  exportRevenue: async () => {
    const blob = await adminApi.exportRevenue();
    return blob;
  },
  exportSales: async () => {
    const blob = await adminApi.exportSales();
    return blob;
  },
};