import axios from 'axios';
import { storage } from '../utils/storage';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1',
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1',
  withCredentials: true,
});

httpClient.interceptors.request.use((config) => {
  const token = storage.get('accessToken');
  const csrfToken = storage.get('csrfToken');
  const method = config.method?.toLowerCase();
  config.headers = config.headers ?? {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (csrfToken && !['get', 'head', 'options'].includes(method ?? 'get')) {
    config.headers['x-csrf-token'] = csrfToken;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      originalRequest.headers = originalRequest.headers ?? {};

      try {
        const response = await refreshClient.post('/auth/refresh');
        storage.set('accessToken', response.data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
        return httpClient(originalRequest);
      } catch {
        storage.remove('accessToken');
      }
    }

    return Promise.reject(error);
  }
);

export default httpClient;