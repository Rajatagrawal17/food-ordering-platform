import { profileApi } from '../api/profileApi';

export const profileService = {
  updateProfile: async (payload) => {
    const response = await profileApi.updateProfile(payload);
    return response.data;
  },
  addAddress: async (address) => {
    const response = await profileApi.addAddress(address);
    return response.data;
  },
  updateAddress: async (index, address) => {
    const response = await profileApi.updateAddress(index, address);
    return response.data;
  },
  deleteAddress: async (index) => {
    const response = await profileApi.deleteAddress(index);
    return response.data;
  },
};
