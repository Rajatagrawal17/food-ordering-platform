import { couponRepository } from '../repositories/couponRepository.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, amount } = req.body;

  if (!code) {
    throw new ApiError(400, 'Coupon code is required');
  }

  if (amount === undefined || amount < 0) {
    throw new ApiError(400, 'Order amount must be a positive number');
  }

  const coupon = await couponRepository.findByCode(code.toUpperCase());

  if (!coupon) {
    throw new ApiError(404, 'Coupon code is invalid or expired');
  }

  if (coupon.expirationDate < new Date()) {
    throw new ApiError(400, 'Coupon code has expired');
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, 'Coupon usage limit has been reached');
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Number(((amount * coupon.discountValue) / 100).toFixed(2));
  } else if (coupon.discountType === 'fixed') {
    discount = Math.min(coupon.discountValue, amount);
  }

  const finalAmount = Number((amount - discount).toFixed(2));

  res.status(200).json({
    success: true,
    data: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount,
      finalAmount,
    },
  });
});
