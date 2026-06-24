import crypto from 'crypto';
import { ApiError } from '../utils/ApiError.js';
import { cartRepository } from '../repositories/cartRepository.js';
import { orderRepository } from '../repositories/orderRepository.js';
import { paymentRepository } from '../repositories/paymentRepository.js';
import { couponRepository } from '../repositories/couponRepository.js';
import { getRazorpayClient } from '../config/razorpay.js';
import { emitOrderCreated, emitOrderStatusUpdated, emitPaymentEvent } from '../socket/index.js';
import { systemEvents, EVENTS } from '../utils/events.js';

const buildCartSnapshot = (cart) => {
  return cart.items.map((item) => ({
    food: item.food._id ?? item.food,
    name: item.name,
    image: item.image,
    price: item.price,
    quantity: item.quantity,
  }));
};

const buildOrderAmount = (cart) => {
  return cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const paymentService = {
  createPaymentIntent: async (userId, address, couponCode) => {
    const cart = await cartRepository.findByUser(userId);

    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, 'Cart is empty');
    }

    const razorpayClient = getRazorpayClient();

    if (!razorpayClient) {
      throw new ApiError(503, 'Payment gateway is not configured');
    }

    const baseAmount = buildOrderAmount(cart);
    let amount = baseAmount;
    let discount = 0;

    if (couponCode) {
      const coupon = await couponRepository.findByCode(couponCode.toUpperCase());
      if (!coupon) {
        throw new ApiError(400, 'Coupon code is invalid');
      }
      if (coupon.expirationDate < new Date()) {
        throw new ApiError(400, 'Coupon code has expired');
      }
      if (coupon.usedCount >= coupon.usageLimit) {
        throw new ApiError(400, 'Coupon usage limit has been reached');
      }
      if (coupon.discountType === 'percentage') {
        discount = Number(((baseAmount * coupon.discountValue) / 100).toFixed(2));
      } else if (coupon.discountType === 'fixed') {
        discount = Math.min(coupon.discountValue, baseAmount);
      }
      amount = Number((baseAmount - discount).toFixed(2));
    }

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
      paymentStatus: 'pending',
      orderStatus: 'placed',
      address,
    });

    const currency = 'INR';
    const razorpayOrder = await razorpayClient.orders.create({
      amount: amount * 100,
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    });

    const transaction = await paymentRepository.create({
      user: userId,
      cart: buildCartSnapshot(cart),
      address,
      amount,
      currency,
      razorpayOrderId: razorpayOrder.id,
      status: 'initiated',
      order: order._id,
      couponCode: couponCode ? couponCode.toUpperCase() : undefined,
      discount,
    });

    await orderRepository.updateById(order._id, { paymentTransaction: transaction._id });

    return {
      keyId: process.env.RAZORPAY_KEY_ID,
      amount,
      currency,
      razorpayOrderId: razorpayOrder.id,
      name: 'Ember Bites',
      description: 'Food order payment',
      prefill: {},
    };
  },
  verifyPayment: async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
    const transaction = await paymentRepository.findByRazorpayOrderId(razorpayOrderId);

    if (!transaction) {
      throw new ApiError(404, 'Payment transaction not found');
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      await paymentRepository.updateByRazorpayOrderId(razorpayOrderId, {
        status: 'failed',
        razorpayPaymentId,
        razorpaySignature,
        failureReason: 'Signature verification failed',
      });

      emitPaymentEvent(transaction.user.toString(), {
        status: 'failed',
        razorpayOrderId,
      });

      throw new ApiError(400, 'Payment verification failed');
    }

    const order = await orderRepository.updateById(transaction.order, {
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
    });

    await paymentRepository.updateByRazorpayOrderId(razorpayOrderId, {
      status: 'successful',
      razorpayPaymentId,
      razorpaySignature,
      order: order._id,
    });

    if (transaction.couponCode) {
      const coupon = await couponRepository.findByCode(transaction.couponCode);
      if (coupon) {
        await couponRepository.incrementUsedCount(coupon._id);
      }
    }

    await cartRepository.clear(transaction.user);
    emitOrderCreated(transaction.user.toString(), order);
    emitOrderStatusUpdated(transaction.user.toString(), order);
    emitPaymentEvent(transaction.user.toString(), {
      status: 'successful',
      orderId: order._id,
    });

    systemEvents.emit(EVENTS.ORDER_CREATED, order);

    return order;
  },
  recordFailure: async ({ razorpayOrderId, failureReason }) => {
    const transaction = await paymentRepository.updateByRazorpayOrderId(razorpayOrderId, {
      status: 'failed',
      failureReason,
    });

    if (transaction) {
      emitPaymentEvent(transaction.user.toString(), {
        status: 'failed',
        razorpayOrderId,
        failureReason,
      });
    }

    return transaction;
  },
  handleWebhook: async (webhookBody, signature) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new ApiError(503, 'Webhook secret not configured');
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(webhookBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new ApiError(400, 'Invalid webhook signature');
    }

    const payload = JSON.parse(webhookBody);
    const event = payload.event;

    if (event === 'payment.captured') {
      const paymentEntity = payload.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      const transaction = await paymentRepository.findByRazorpayOrderId(razorpayOrderId);
      if (!transaction) {
        throw new ApiError(404, 'Payment transaction not found');
      }

      if (transaction.status === 'successful') {
        return { status: 'already_processed' };
      }

      const order = await orderRepository.updateById(transaction.order, {
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
      });

      await paymentRepository.updateByRazorpayOrderId(razorpayOrderId, {
        status: 'successful',
        razorpayPaymentId,
        razorpaySignature: 'webhook_verified',
        order: order._id,
      });

      if (transaction.couponCode) {
        const coupon = await couponRepository.findByCode(transaction.couponCode);
        if (coupon) {
          await couponRepository.incrementUsedCount(coupon._id);
        }
      }

      await cartRepository.clear(transaction.user);
      emitOrderCreated(transaction.user.toString(), order);
      emitOrderStatusUpdated(transaction.user.toString(), order);
      emitPaymentEvent(transaction.user.toString(), {
        status: 'successful',
        orderId: order._id,
      });

      systemEvents.emit(EVENTS.ORDER_CREATED, order);

      return { status: 'processed', orderId: order._id };
    }

    if (event === 'payment.failed') {
      const paymentEntity = payload.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const failureReason = paymentEntity.error_description ?? 'Payment failed';

      await paymentRepository.updateByRazorpayOrderId(razorpayOrderId, {
        status: 'failed',
        failureReason,
      });

      const transaction = await paymentRepository.findByRazorpayOrderId(razorpayOrderId);
      if (transaction) {
        emitPaymentEvent(transaction.user.toString(), {
          status: 'failed',
          razorpayOrderId,
          failureReason,
        });
      }
      return { status: 'failed_recorded' };
    }

    return { status: 'ignored' };
  },
};