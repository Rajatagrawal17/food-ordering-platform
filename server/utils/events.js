import { EventEmitter } from 'node:events';
import { backgroundQueue } from './queue.js';
import { notificationRepository } from '../repositories/notificationRepository.js';
import { emitOrderStatusUpdated, emitNotification } from '../socket/index.js';
import { cacheService } from '../services/cacheService.js';

export const systemEvents = new EventEmitter();

export const EVENTS = {
  ORDER_CREATED: 'order:created',
  ORDER_STATUS_UPDATED: 'order:status:updated',
  PAYMENT_SUCCESSFUL: 'payment:successful',
  PAYMENT_FAILED: 'payment:failed',
};

systemEvents.on(EVENTS.ORDER_CREATED, async (order) => {
  if (!order || !order.user) {
    return;
  }
  const userId = order.user._id ?? order.user;

  const notification = await notificationRepository.create({
    user: userId,
    title: 'Order Placed!',
    message: `Your order #${order._id.toString().slice(-6)} has been placed successfully.`,
    type: 'order',
  });

  emitNotification(userId.toString(), notification);

  await cacheService.delByPattern('cache:*admin*');

  await backgroundQueue.addJob('email:order-placed', {
    orderId: order._id.toString(),
    userId: userId.toString(),
  });
});

systemEvents.on(EVENTS.ORDER_STATUS_UPDATED, async (order) => {
  if (!order || !order.user) {
    return;
  }
  const userId = order.user._id ?? order.user;

  const notification = await notificationRepository.create({
    user: userId,
    title: `Order Update`,
    message: `Your order #${order._id.toString().slice(-6)} status is now ${order.orderStatus.replace('_', ' ')}.`,
    type: 'order',
  });

  emitNotification(userId.toString(), notification);

  await cacheService.delByPattern('cache:*admin*');

  await backgroundQueue.addJob('email:order-status', {
    orderId: order._id.toString(),
    userId: userId.toString(),
    status: order.orderStatus,
  });

  emitOrderStatusUpdated(userId.toString(), order);
});
