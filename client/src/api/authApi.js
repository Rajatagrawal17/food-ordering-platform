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
  refresh: async () => {
    const response = await httpClient.post('/auth/refresh');
    return response.data;
  },
  me: async () => {
    const response = await httpClient.get('/auth/me');
    return response.data;
  },
};