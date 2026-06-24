import { Order } from '../models/Order.js';

export const orderRepository = {
  create: (payload) => Order.create(payload),
  findById: (id) => Order.findById(id).populate('items.food user paymentTransaction'),
  findByUser: ({ userId, page, limit }) =>
    Order.find({ user: userId })
      .populate('items.food')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }),
  countByUser: (userId) => Order.countDocuments({ user: userId }),
  findMany: ({ page, limit }) =>
    Order.find()
      .populate('user items.food')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }),
  count: (filter = {}) => Order.countDocuments(filter),
  aggregateRevenue: () => Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, revenue: { $sum: '$amount' } } }]),
  aggregateRevenueOverTime: () =>
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  aggregateTopSellingFoods: () =>
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 10 },
    ]),
  updateById: (id, payload) => Order.findByIdAndUpdate(id, payload, { new: true }).populate('items.food user'),
};