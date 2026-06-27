import mongoose from 'mongoose';
import { softDeletePlugin } from './plugins/softDelete.js';

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, trim: true },
    cuisines: [{ type: String, trim: true }],
    image: { type: String, required: true },
    logo: { type: String },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    avgPrepTime: { type: Number, required: true },
    address: {
      city: { type: String, required: true },
      area: { type: String, required: true },
    },
    isOpen: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

restaurantSchema.plugin(softDeletePlugin);

export const Restaurant = mongoose.model('Restaurant', restaurantSchema);
