import { categoryApi } from '../api/categoryApi';

export const categoryService = {
  list: async () => {
    const response = await categoryApi.list();
    return response.data;
  },
};