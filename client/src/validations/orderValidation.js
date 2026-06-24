import { z } from 'zod';

export const checkoutSchema = z.object({
  label: z.string().optional(),
  street: z.string().min(2, 'Street is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2).optional(),
});