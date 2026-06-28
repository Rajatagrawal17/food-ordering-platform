import axios from 'axios';

const securityClient = axios.create({
  baseURL: import.meta.env.PROD ? '/api/v1' : (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1'),
  withCredentials: true,
});

export const securityApi = {
  csrfToken: async () => {
    const response = await securityClient.get('/csrf-token');
    return response.data;
  },
};