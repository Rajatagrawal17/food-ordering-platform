import axios from 'axios';
import { storage } from '../utils/storage';
import { securityService } from '../services/securityService';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1',
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1',
  withCredentials: true,
});

httpClient.interceptors.request.use(async (config) => {
  const token = storage.get('accessToken');
  const method = config.method?.toLowerCase();
  config.headers = config.headers ?? {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!['get', 'head', 'options'].includes(method ?? 'get')) {
    // Wait for the in-flight CSRF bootstrap to finish rather than reading
    // storage synchronously. On a cold-starting backend (Render free tier
    // can take seconds, occasionally tens of seconds, to wake up) or on a
    // fast form submission right after page load, the token may not be in
    // storage yet even though a fetch for it is already underway. Racing
    // ahead without it means the request goes out with no x-csrf-token
    // header at all, and the server correctly rejects it with 403 — that
    // is not a backend bug, it is this client sending an incomplete request.
    const csrfToken = await securityService.whenCsrfReady();

    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken;
    }
  }

  return config;
});

refreshClient.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();
  config.headers = config.headers ?? {};

  if (!['get', 'head', 'options'].includes(method ?? 'get')) {
    const csrfToken = await securityService.whenCsrfReady();
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken;
    }
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