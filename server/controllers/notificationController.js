import { notificationRepository } from '../repositories/notificationRepository.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationRepository.findByUser(req.user._id);

  res.status(200).json({
    success: true,
    data: notifications,
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, 'Notification ID is required');
  }

  const notification = await notificationRepository.markAsRead(id, req.user._id);

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  res.status(200).json({
    success: true,
    data: notification,
  });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationRepository.markAllAsRead(req.user._id);

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});
