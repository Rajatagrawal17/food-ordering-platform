import { asyncHandler } from '../utils/asyncHandler.js';
import { cartService } from '../services/cartService.js';

export const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user._id);

  res.status(200).json({
    success: true,
    data: cart,
  });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateItem(req.user._id, req.body.foodId, req.body.quantity);

  res.status(200).json({
    success: true,
    data: cart,
  });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user._id, req.params.itemId);

  res.status(200).json({
    success: true,
    data: cart,
  });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clear(req.user._id);

  res.status(200).json({
    success: true,
    data: cart,
  });
});