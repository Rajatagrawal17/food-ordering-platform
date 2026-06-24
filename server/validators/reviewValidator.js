import { z } from 'zod';

export const reviewSchema = z.object({
  body: z.object({
    foodId: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(3).max(500),
    isFeatured: z.boolean().optional(),
  }),
});