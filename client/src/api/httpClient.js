import axios from 'axios';
import { storage } from '../utils/storage';

const httpClient = axios.create({
  baseURL: import.meta.env.PROD ? '/api/v1' : (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1'),
  withCredentials: true,
});


httpClient.interceptors.request.use(async (config) => {
  const token = storage.get('accessToken');
  const method = config.method?.toLowerCase();
  config.headers = config.headers ?? {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }



  return config;
});


httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.remove('accessToken');
      storage.remove('currentUser');
    }
    return Promise.reject(error);
  }
);

export default httpClient;