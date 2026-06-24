import { asyncHandler } from '../utils/asyncHandler.js';
import { orderService } from '../services/orderService.js';

export const checkout = asyncHandler(async (req, res) => {
  const order = await orderService.checkout(req.user._id, req.body.address);

  res.status(201).json({
    success: true,
    data: order,
  });
});

export const listOrders = asyncHandler(async (req, res) => {
  const data = await orderService.listByUser(req.user._id, req.query);

  res.status(200).json({
    success: true,
    data,
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getById(req.params.id, req.user._id, req.user.role);

  res.status(200).json({
    success: true,
    data: order,
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateStatus(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: order,
  });
});