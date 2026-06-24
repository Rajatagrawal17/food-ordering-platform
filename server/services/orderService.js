import { ApiError } from '../utils/ApiError.js';
import { buildPagination } from '../utils/pagination.js';
import { cartRepository } from '../repositories/cartRepository.js';
import { orderRepository } from '../repositories/orderRepository.js';
import { systemEvents, EVENTS } from '../utils/events.js';

export const orderService = {
  checkout: async (userId, address) => {
    const cart = await cartRepository.findByUser(userId);

    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, 'Cart is empty');
    }

    const amount = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
    const order = await orderRepository.create({
      user: userId,
      items: cart.items.map((item) => ({
        food: item.food._id ?? item.food,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),
      amount,
      address,
      paymentStatus: 'pending',
      orderStatus: 'placed',
    });

    await cartRepository.clear(userId);

    return order;
  },
  listByUser: async (userId, query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const total = await orderRepository.countByUser(userId);
    const orders = await orderRepository.findByUser({ userId, page, limit });

    return {
      orders,
      pagination: buildPagination({ page, limit, total }),
    };
  },
  getById: async (id, userId, role) => {
    const order = await orderRepository.findById(id);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    if (role !== 'admin' && order.user._id.toString() !== userId) {
      throw new ApiError(403, 'Forbidden');
    }

    if (order.paymentTransaction && order.paymentStatus === 'pending') {
      const orderJson = order.toJSON();
      if (orderJson.paymentTransaction) {
        orderJson.paymentTransaction.keyId = process.env.RAZORPAY_KEY_ID;
      }
      return orderJson;
    }

    return order;
  },
  updateStatus: async (id, payload) => {
    const order = await orderRepository.updateById(id, payload);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    systemEvents.emit(EVENTS.ORDER_STATUS_UPDATED, order);

    return order;
  },
  listAll: async (query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const total = await orderRepository.count();
    const orders = await orderRepository.findMany({ page, limit });

    return {
      orders,
      pagination: buildPagination({ page, limit, total }),
    };
  },
};