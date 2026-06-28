import httpClient from './httpClient';

export const paymentApi = {
  createIntent: async (payload) => {
    const response = await httpClient.post('/payments/create-order', payload);
    return response.data;
  },
  dummyUPI: async (payload) => {
    const response = await httpClient.post('/payments/dummy-upi', payload);
    return response.data;
  },
  verify: async (payload) => {
    const response = await httpClient.post('/payments/verify', payload);
    return response.data;
  },
  failure: async (payload) => {
    const response = await httpClient.post('/payments/failure', payload);
    return response.data;
  },
};