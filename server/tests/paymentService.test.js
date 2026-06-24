import { jest, expect, test, beforeEach } from '@jest/globals';

const createPaymentOrder = jest.fn();
const createPaymentRecord = jest.fn();
const findPaymentRecord = jest.fn();
const updatePaymentRecord = jest.fn();
const clearCart = jest.fn();
const createOrder = jest.fn();
const updateOrder = jest.fn();
const findCart = jest.fn();
const emitOrderCreated = jest.fn();
const emitOrderStatusUpdated = jest.fn();
const emitPaymentEvent = jest.fn();
const emitNotification = jest.fn();
const emitDashboardUpdate = jest.fn();
const initializeSocket = jest.fn();
const getSocketServer = jest.fn();
const findCouponByCode = jest.fn();
const incrementUsedCount = jest.fn();

await jest.unstable_mockModule('../repositories/couponRepository.js', () => ({
  couponRepository: {
    findByCode: findCouponByCode,
    incrementUsedCount,
  },
}));

await jest.unstable_mockModule('../config/razorpay.js', () => ({
  getRazorpayClient: () => ({
    orders: {
      create: createPaymentOrder,
    },
  }),
}));

await jest.unstable_mockModule('../repositories/paymentRepository.js', () => ({
  paymentRepository: {
    create: createPaymentRecord,
    findByRazorpayOrderId: findPaymentRecord,
    updateByRazorpayOrderId: updatePaymentRecord,
    count: jest.fn(),
    deleteAll: jest.fn(),
  },
}));

await jest.unstable_mockModule('../repositories/cartRepository.js', () => ({
  cartRepository: {
    findByUser: findCart,
    clear: clearCart,
  },
}));

await jest.unstable_mockModule('../repositories/orderRepository.js', () => ({
  orderRepository: {
    create: createOrder,
    findById: jest.fn(),
    updateById: updateOrder,
    findByUser: jest.fn(),
    countByUser: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    aggregateRevenue: jest.fn(),
  },
}));

await jest.unstable_mockModule('../socket/index.js', () => ({
  emitOrderCreated,
  emitOrderStatusUpdated,
  emitPaymentEvent,
  emitNotification,
  emitDashboardUpdate,
  initializeSocket,
  getSocketServer,
}));

const { paymentService } = await import('../services/paymentService.js');

beforeEach(() => {
  process.env.RAZORPAY_KEY_SECRET = 'test-secret';
  process.env.RAZORPAY_KEY_ID = 'test-key';
  jest.clearAllMocks();
});

test('creates payment intent from cart contents', async () => {
  findCart.mockResolvedValue({
    items: [
      { food: { _id: 'food-1' }, name: 'Paneer Bowl', image: 'img-1', price: 200, quantity: 2 },
      { food: { _id: 'food-2' }, name: 'Burger', image: 'img-2', price: 100, quantity: 1 },
    ],
  });
  createPaymentOrder.mockResolvedValue({ id: 'razorpay-order-1' });
  createOrder.mockResolvedValue({ _id: 'order-1' });
  updateOrder.mockResolvedValue({ _id: 'order-1' });
  createPaymentRecord.mockResolvedValue({ _id: 'payment-1' });

  const result = await paymentService.createPaymentIntent('user-1', { street: 'A', city: 'B' });

  expect(createPaymentOrder).toHaveBeenCalledWith({ amount: 50000, currency: 'INR', receipt: expect.any(String), payment_capture: 1 });
  expect(createOrder).toHaveBeenCalled();
  expect(createPaymentRecord).toHaveBeenCalled();
  expect(result.razorpayOrderId).toBe('razorpay-order-1');
  expect(result.amount).toBe(500);
});

test('verifies payment and creates order', async () => {
  findPaymentRecord.mockResolvedValue({
    _id: 'payment-1',
    user: 'user-1',
    cart: [{ food: 'food-1', name: 'Paneer Bowl', image: 'img', price: 200, quantity: 2 }],
    address: { street: 'A', city: 'B' },
    amount: 400,
    order: 'order-1',
  });
  updateOrder.mockResolvedValue({ _id: 'order-1' });
  updatePaymentRecord.mockResolvedValue({ user: 'user-1' });
  clearCart.mockResolvedValue(true);

  const crypto = await import('node:crypto');
  const signature = crypto.createHmac('sha256', 'test-secret').update('order-1|payment-1').digest('hex');

  const order = await paymentService.verifyPayment({
    razorpayOrderId: 'order-1',
    razorpayPaymentId: 'payment-1',
    razorpaySignature: signature,
  });

  expect(updateOrder).toHaveBeenCalledWith('order-1', { paymentStatus: 'paid', orderStatus: 'confirmed' });
  expect(clearCart).toHaveBeenCalledWith('user-1');
  expect(order._id).toBe('order-1');
});

test('creates payment intent with coupon discount applied', async () => {
  findCart.mockResolvedValue({
    items: [
      { food: { _id: 'food-1' }, name: 'Paneer Bowl', image: 'img-1', price: 200, quantity: 2 },
    ],
  });
  findCouponByCode.mockResolvedValue({
    _id: 'coupon-1',
    code: 'SAVE50',
    discountType: 'fixed',
    discountValue: 50,
    expirationDate: new Date(Date.now() + 86400000),
    usageLimit: 10,
    usedCount: 0,
  });
  createPaymentOrder.mockResolvedValue({ id: 'razorpay-order-2' });
  createOrder.mockResolvedValue({ _id: 'order-2' });
  updateOrder.mockResolvedValue({ _id: 'order-2' });
  createPaymentRecord.mockResolvedValue({ _id: 'payment-2' });

  const result = await paymentService.createPaymentIntent('user-1', { street: 'A', city: 'B' }, 'SAVE50');

  expect(createPaymentOrder).toHaveBeenCalledWith({ amount: 35000, currency: 'INR', receipt: expect.any(String), payment_capture: 1 });
  expect(createOrder).toHaveBeenCalled();
  expect(createPaymentRecord).toHaveBeenCalledWith(expect.objectContaining({
    amount: 350,
    couponCode: 'SAVE50',
    discount: 50,
  }));
  expect(result.amount).toBe(350);
});

test('verifies payment with coupon and increments its used count', async () => {
  findPaymentRecord.mockResolvedValue({
    _id: 'payment-2',
    user: 'user-1',
    cart: [{ food: 'food-1', name: 'Paneer Bowl', image: 'img', price: 200, quantity: 2 }],
    address: { street: 'A', city: 'B' },
    amount: 350,
    couponCode: 'SAVE50',
    order: 'order-2',
  });
  findCouponByCode.mockResolvedValue({ _id: 'coupon-1' });
  incrementUsedCount.mockResolvedValue({});
  updateOrder.mockResolvedValue({ _id: 'order-2' });
  updatePaymentRecord.mockResolvedValue({ user: 'user-1' });
  clearCart.mockResolvedValue(true);

  const crypto = await import('node:crypto');
  const signature = crypto.createHmac('sha256', 'test-secret').update('order-2|payment-2').digest('hex');

  await paymentService.verifyPayment({
    razorpayOrderId: 'order-2',
    razorpayPaymentId: 'payment-2',
    razorpaySignature: signature,
  });

  expect(updateOrder).toHaveBeenCalledWith('order-2', { paymentStatus: 'paid', orderStatus: 'confirmed' });
  expect(incrementUsedCount).toHaveBeenCalledWith('coupon-1');
});