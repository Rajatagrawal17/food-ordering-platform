import { z } from 'zod';

export const foodSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    description: z.string().min(10).max(1000),
    category: z.string().min(2).max(60),
    image: z.string().url(),
    price: z.number().nonnegative(),
    rating: z.number().min(0).max(5).optional(),
    availability: z.boolean().optional(),
    prepTime: z.number().int().positive().optional(),
    tags: z.array(z.string().min(1).max(30)).optional(),
  }),
});

export const foodUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120).optional(),
    description: z.string().min(10).max(1000).optional(),
    category: z.string().min(2).max(60).optional(),
    image: z.string().url().optional(),
    price: z.number().nonnegative().optional(),
    rating: z.number().min(0).max(5).optional(),
    availability: z.boolean().optional(),
    prepTime: z.number().int().positive().optional(),
    tags: z.array(z.string().min(1).max(30)).optional(),
  }),
});