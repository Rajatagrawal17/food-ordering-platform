import { z } from 'zod';

const addressSchema = z.object({
  label: z.string().optional(),
  street: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(3),
  country: z.string().min(2).optional(),
});

export const createPaymentIntentSchema = z.object({
  body: z.object({
    address: addressSchema,
    couponCode: z.string().optional(),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1),
  }),
});

export const failureSchema = z.object({
  body: z.object({
    razorpayOrderId: z.string().min(1),
    failureReason: z.string().min(1),
  }),
});