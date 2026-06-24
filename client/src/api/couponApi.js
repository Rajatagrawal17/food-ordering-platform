import httpClient from './httpClient';

export const couponApi = {
  validate: async ({ code, amount }) => {
    const response = await httpClient.post('/coupons/validate', { code, amount });
    return response.data;
  },
};
