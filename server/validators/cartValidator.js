import { z } from 'zod';

export const cartUpdateSchema = z.object({
  body: z.object({
    foodId: z.string().min(1),
    quantity: z.number().int().positive(),
  }),
});

export const cartItemIdSchema = z.object({
  params: z.object({
    itemId: z.string().min(1),
  }),
});