import { authApi } from '../api/authApi';
import { storage } from '../utils/storage';

const ACCESS_TOKEN_KEY = 'accessToken';
const USER_KEY = 'currentUser';

export const authService = {
  register: async (payload) => {
    const response = await authApi.register(payload);
    storage.set(ACCESS_TOKEN_KEY, response.data.data.accessToken);
    storage.set(USER_KEY, response.data.data.user);
    return response.data.data;
  },
  login: async (payload) => {
    const response = await authApi.login(payload);
    storage.set(ACCESS_TOKEN_KEY, response.data.data.accessToken);
    storage.set(USER_KEY, response.data.data.user);
    return response.data.data;
  },
  logout: async () => {
    await authApi.logout();
    storage.remove(ACCESS_TOKEN_KEY);
    storage.remove(USER_KEY);
  },
  refresh: async () => {
    const response = await authApi.refresh();
    storage.set(ACCESS_TOKEN_KEY, response.data.data.accessToken);
    storage.set(USER_KEY, response.data.data.user);
    return response.data.data;
  },
  me: async () => {
    const response = await authApi.me();
    storage.set(USER_KEY, response.data.data);
    return response.data.data;
  },
  getStoredAuth: () => ({
    token: storage.get(ACCESS_TOKEN_KEY),
    user: storage.get(USER_KEY),
  }),
};