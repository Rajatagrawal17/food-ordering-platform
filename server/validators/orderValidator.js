import { z } from 'zod';

const addressSchema = z.object({
  label: z.string().optional(),
  street: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(3),
  country: z.string().min(2).optional(),
});

export const checkoutSchema = z.object({
  body: z.object({
    address: addressSchema,
    paymentMethod: z.enum(['cod', 'card', 'wallet']).optional(),
  }),
});

export const orderStatusSchema = z.object({
  body: z.object({
    orderStatus: z.enum(['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']),
    paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  }),
  params: z.object({
    orderId: z.string().min(1),
  }),
});