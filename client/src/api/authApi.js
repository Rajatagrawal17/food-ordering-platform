import httpClient from './httpClient';

export const authApi = {
  register: async (payload) => {
    const response = await httpClient.post('/auth/register', payload);
    return response.data;
  },
  login: async (payload) => {
    const response = await httpClient.post('/auth/login', payload);
    return response.data;
  },
  logout: async () => {
    const response = await httpClient.post('/auth/logout');
    return response.data;
  },
  me: async () => {
    const response = await httpClient.get('/auth/me');
    return response.data;
  },
  forgotPassword: async (email) => {
    const response = await httpClient.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (token, password) => {
    const response = await httpClient.post('/auth/reset-password', { token, password });
    return response.data;
  },
};