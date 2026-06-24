import { asyncHandler } from '../utils/asyncHandler.js';
import { reviewService } from '../services/reviewService.js';

export const listReviewsByFood = asyncHandler(async (req, res) => {
  const reviews = await reviewService.listByFood(req.params.foodId);

  res.status(200).json({
    success: true,
    data: reviews,
  });
});

export const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.create(req.user._id, req.body);

  res.status(201).json({
    success: true,
    data: review,
  });
});

export const featuredReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.featured();

  res.status(200).json({
    success: true,
    data: reviews,
  });
});