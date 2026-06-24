import { backgroundQueue } from './queue.js';
import { emailService } from '../services/emailService.js';
import { orderRepository } from '../repositories/orderRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { logger } from '../config/logger.js';
import { emailTemplates } from '../services/emailTemplates.js';

export const initializeWorker = () => {
  backgroundQueue.registerHandler('email:welcome', async (data) => {
    try {
      const user = await userRepository.findById(data.userId);
      if (!user) return;
      const template = emailTemplates.getWelcomeTemplate(user.name);
      await emailService.sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });
    } catch (error) {
      logger.error({ error, data }, 'Error executing email:welcome job');
    }
  });

  backgroundQueue.registerHandler('email:order-placed', async (data) => {
    try {
      const order = await orderRepository.findById(data.orderId);
      const user = await userRepository.findById(data.userId);
      if (!order || !user) return;
      const template = emailTemplates.getOrderPlacedTemplate(user.name, order._id.toString(), order.amount);
      await emailService.sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });
    } catch (error) {
      logger.error({ error, data }, 'Error executing email:order-placed job');
    }
  });

  backgroundQueue.registerHandler('email:order-status', async (data) => {
    try {
      const order = await orderRepository.findById(data.orderId);
      const user = await userRepository.findById(data.userId);
      if (!order || !user) return;
      const template = emailTemplates.getOrderStatusTemplate(user.name, order._id.toString(), data.status);
      await emailService.sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });
    } catch (error) {
      logger.error({ error, data }, 'Error executing email:order-status job');
    }
  });

  backgroundQueue.registerHandler('email:password-reset', async (data) => {
    try {
      const template = emailTemplates.getPasswordResetTemplate(data.name, data.resetUrl);
      await emailService.sendEmail({
        to: data.email,
        subject: template.subject,
        html: template.html,
      });
    } catch (error) {
      logger.error({ error, data }, 'Error executing email:password-reset job');
    }
  });

  backgroundQueue.registerHandler('email:coupon-issued', async (data) => {
    try {
      const user = await userRepository.findById(data.userId);
      if (!user) return;
      const template = emailTemplates.getCouponIssuedTemplate(user.name, data.code, data.discountValue, data.discountType);
      await emailService.sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });
    } catch (error) {
      logger.error({ error, data }, 'Error executing email:coupon-issued job');
    }
  });

  if (process.env.NODE_ENV !== 'test') {
    backgroundQueue.startWorker();
  }
};
