import { PaymentTransaction } from '../models/PaymentTransaction.js';

export const paymentRepository = {
  create: (payload) => PaymentTransaction.create(payload),
  findByRazorpayOrderId: (razorpayOrderId) => PaymentTransaction.findOne({ razorpayOrderId }),
  updateByRazorpayOrderId: (razorpayOrderId, payload) =>
    PaymentTransaction.findOneAndUpdate({ razorpayOrderId }, payload, { new: true }),
  count: (filter = {}) => PaymentTransaction.countDocuments(filter),
  deleteAll: () => PaymentTransaction.deleteMany({}),
};