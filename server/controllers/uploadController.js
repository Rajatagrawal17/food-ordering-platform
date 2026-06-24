import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadService } from '../services/uploadService.js';
import { ApiError } from '../utils/ApiError.js';

export const uploadImage = asyncHandler(async (req, res) => {
  const file = req.file;

  if (!file) {
    throw new ApiError(400, 'No image file uploaded');
  }

  const data = await uploadService.uploadImage(file);

  res.status(201).json({
    success: true,
    data,
  });
});