import httpClient from './httpClient';

export const profileApi = {
  updateProfile: async (payload) => {
    const response = await httpClient.put('/profile', payload);
    return response.data;
  },
  addAddress: async (address) => {
    const response = await httpClient.post('/profile/addresses', address);
    return response.data;
  },
  updateAddress: async (index, address) => {
    const response = await httpClient.put(`/profile/addresses/${index}`, address);
    return response.data;
  },
  deleteAddress: async (index) => {
    const response = await httpClient.delete(`/profile/addresses/${index}`);
    return response.data;
  },
};
