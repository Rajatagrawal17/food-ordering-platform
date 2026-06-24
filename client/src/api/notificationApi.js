import httpClient from './httpClient';

export const notificationApi = {
  getNotifications: async () => {
    const response = await httpClient.get('/notifications');
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await httpClient.patch(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await httpClient.patch('/notifications/read-all');
    return response.data;
  },
};
