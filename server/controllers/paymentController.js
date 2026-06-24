import { asyncHandler } from '../utils/asyncHandler.js';
import { paymentService } from '../services/paymentService.js';

export const createPaymentIntent = asyncHandler(async (req, res) => {
  const data = await paymentService.createPaymentIntent(req.user._id, req.body.address, req.body.couponCode);

  res.status(201).json({
    success: true,
    data,
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const order = await paymentService.verifyPayment(req.body);

  res.status(200).json({
    success: true,
    data: order,
  });
});

export const paymentFailure = asyncHandler(async (req, res) => {
  const transaction = await paymentService.recordFailure(req.body);

  res.status(200).json({
    success: true,
    data: transaction,
  });
});

export const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const webhookBody = req.rawBody;

  const result = await paymentService.handleWebhook(webhookBody, signature);

  res.status(200).json({
    success: true,
    data: result,
  });
});