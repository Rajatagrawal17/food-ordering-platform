import { asyncHandler } from '../utils/asyncHandler.js';
import { foodService } from '../services/foodService.js';

export const listFoods = asyncHandler(async (req, res) => {
  const data = await foodService.list(req.query);

  res.status(200).json({
    success: true,
    data,
  });
});

export const getFoodById = asyncHandler(async (req, res) => {
  const food = await foodService.getById(req.params.id);

  res.status(200).json({
    success: true,
    data: food,
  });
});

export const createFood = asyncHandler(async (req, res) => {
  const food = await foodService.create(req.body);

  res.status(201).json({
    success: true,
    data: food,
  });
});

export const updateFood = asyncHandler(async (req, res) => {
  const food = await foodService.update(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: food,
  });
});

export const deleteFood = asyncHandler(async (req, res) => {
  await foodService.remove(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Food item deleted',
  });
});