import { ApiError } from '../utils/ApiError.js';
import { reviewRepository } from '../repositories/reviewRepository.js';
import { foodRepository } from '../repositories/foodRepository.js';

export const reviewService = {
  listByFood: async (foodId) => reviewRepository.findByFood(foodId),
  featured: async () => reviewRepository.findFeatured(),
  create: async (userId, payload) => {
    const food = await foodRepository.findById(payload.foodId);

    if (!food) {
      throw new ApiError(404, 'Food item not found');
    }

    return reviewRepository.create({
      user: userId,
      food: payload.foodId,
      rating: payload.rating,
      comment: payload.comment,
      isFeatured: Boolean(payload.isFeatured),
    });
  },
};