import { paymentApi } from '../api/paymentApi';
import { httpClient } from '../api/httpClient';

export const paymentService = {
  createIntent: async (payload) => {
    const response = await paymentApi.createIntent(payload);
    return response.data;
  },
  dummyUPI: async (payload) => {
    const response = await paymentApi.dummyUPI(payload);
    return response.data;
  },
  verify: async (payload) => {
    const response = await paymentApi.verify(payload);
    return response.data;
  },
  failure: async (payload) => {
    const response = await paymentApi.failure(payload);
    return response.data;
  },
};