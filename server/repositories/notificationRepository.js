import { Notification } from '../models/Notification.js';

export const notificationRepository = {
  create: (payload) => Notification.create(payload),
  findByUser: (userId) => Notification.find({ user: userId }).sort({ createdAt: -1 }),
  markAsRead: (id, userId) => Notification.findOneAndUpdate({ _id: id, user: userId }, { isRead: true }, { new: true }),
  markAllAsRead: (userId) => Notification.updateMany({ user: userId }, { isRead: true }),
  deleteByUser: (userId) => Notification.deleteMany({ user: userId }),
};
