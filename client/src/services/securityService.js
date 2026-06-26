import { securityApi } from '../api/securityApi';
import { storage } from '../utils/storage';

const CSRF_TOKEN_KEY = 'csrfToken';

export const securityService = {
  refreshCsrfToken: async () => {
    const response = await securityApi.csrfToken();
    storage.set(CSRF_TOKEN_KEY, response.data.csrfToken);
    return response.data.csrfToken;
  },
  getCsrfToken: () => storage.get(CSRF_TOKEN_KEY),
};