import httpClient from './httpClient';

export const categoryApi = {
  list: async () => {
    const response = await httpClient.get('/categories');
    return response.data;
  },
};