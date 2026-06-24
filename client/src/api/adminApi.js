import httpClient from './httpClient';

export const adminApi = {
  overview: async () => {
    const response = await httpClient.get('/admin/overview');
    return response.data;
  },
  users: async (params = {}) => {
    const response = await httpClient.get('/admin/users', { params });
    return response.data;
  },
  orders: async (params = {}) => {
    const response = await httpClient.get('/admin/orders', { params });
    return response.data;
  },
  analytics: async () => {
    const response = await httpClient.get('/admin/analytics');
    return response.data;
  },
  exportRevenue: async () => {
    const response = await httpClient.get('/admin/reports/revenue', { responseType: 'blob' });
    return response.data;
  },
  exportSales: async () => {
    const response = await httpClient.get('/admin/reports/sales', { responseType: 'blob' });
    return response.data;
  },
};