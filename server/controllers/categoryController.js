import { asyncHandler } from '../utils/asyncHandler.js';
import { categoryService } from '../services/categoryService.js';

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.list();

  res.status(200).json({
    success: true,
    data: categories,
  });
});