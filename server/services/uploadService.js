import streamifier from 'streamifier';
import { cloudinary, configureCloudinary } from '../config/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export const uploadService = {
  uploadImage: async (file) => {
    configureCloudinary();

    if (!cloudinary?.uploader) {
      throw new ApiError(503, 'Media storage is not configured');
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new ApiError(400, 'Unsupported image format');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'food-ordering-platform',
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error || !result) {
            reject(new ApiError(500, 'Image upload failed'));
            return;
          }

          resolve({
            url: result.secure_url,
            thumbnail: cloudinary.url(result.public_id, {
              width: 320,
              height: 240,
              crop: 'fill',
              quality: 'auto',
              fetch_format: 'auto',
            }),
            publicId: result.public_id,
          });
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  },
};