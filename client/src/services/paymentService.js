import { paymentApi } from '../api/paymentApi';

export const paymentService = {
  createIntent: async (payload) => {
    const response = await paymentApi.createIntent(payload);
    return response.data.data;
  },
  verify: async (payload) => {
    const response = await paymentApi.verify(payload);
    return response.data.data;
  },
  failure: async (payload) => {
    const response = await paymentApi.failure(payload);
    return response.data.data;
  },
};