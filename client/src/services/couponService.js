import { couponApi } from '../api/couponApi';

export const couponService = {
  validate: async ({ code, amount }) => {
    const response = await couponApi.validate({ code, amount });
    return response.data;
  },
};
