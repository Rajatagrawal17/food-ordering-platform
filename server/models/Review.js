import mongoose from 'mongoose';
import { softDeletePlugin } from './plugins/softDelete.js';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5, index: true },
    comment: { type: String, required: true, trim: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ food: 1, createdAt: -1 });

reviewSchema.plugin(softDeletePlugin);

export const Review = mongoose.model('Review', reviewSchema);