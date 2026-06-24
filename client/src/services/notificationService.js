import { notificationApi } from '../api/notificationApi';

export const notificationService = {
  getNotifications: async () => {
    const response = await notificationApi.getNotifications();
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await notificationApi.markAsRead(id);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await notificationApi.markAllAsRead();
    return response.data;
  },
};
