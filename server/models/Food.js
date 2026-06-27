import mongoose from 'mongoose';
import { softDeletePlugin } from './plugins/softDelete.js';

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    availability: { type: Boolean, default: true, index: true },
    prepTime: { type: Number, default: 15 },
    tags: [{ type: String, trim: true }],
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  },
  { timestamps: true }
);

foodSchema.index({ name: 'text', description: 'text', category: 'text', tags: 'text' });
foodSchema.index({ category: 1, availability: 1, createdAt: -1 });

foodSchema.plugin(softDeletePlugin);

export const Food = mongoose.model('Food', foodSchema);