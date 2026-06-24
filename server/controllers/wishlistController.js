import { wishlistRepository } from '../repositories/wishlistRepository.js';
import { foodRepository } from '../repositories/foodRepository.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await wishlistRepository.findByUser(req.user._id);

  if (!wishlist) {
    wishlist = await wishlistRepository.create(req.user._id);
  }

  res.status(200).json({
    success: true,
    data: wishlist,
  });
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const { foodId } = req.body;

  if (!foodId) {
    throw new ApiError(400, 'Food ID is required');
  }

  const food = await foodRepository.findById(foodId);
  if (!food) {
    throw new ApiError(404, 'Food item not found');
  }

  const wishlist = await wishlistRepository.addFood(req.user._id, foodId);

  res.status(200).json({
    success: true,
    data: wishlist,
  });
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { foodId } = req.params;

  if (!foodId) {
    throw new ApiError(400, 'Food ID is required');
  }

  const wishlist = await wishlistRepository.removeFood(req.user._id, foodId);

  res.status(200).json({
    success: true,
    data: wishlist,
  });
});
