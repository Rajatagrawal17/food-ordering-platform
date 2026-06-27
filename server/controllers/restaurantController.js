import { asyncHandler } from '../utils/asyncHandler.js';
import { restaurantService } from '../services/restaurantService.js';
import { foodService } from '../services/foodService.js';

export const listRestaurants = asyncHandler(async (req, res) => {
  const data = await restaurantService.list(req.query);

  res.status(200).json({
    success: true,
    data,
  });
});

export const getRestaurantById = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.getById(req.params.id);
  const foodsResult = await foodService.list({ restaurant: req.params.id, limit: 100 });

  res.status(200).json({
    success: true,
    data: {
      restaurant,
      foods: foodsResult.foods,
    },
  });
});

export const createRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.create(req.body);

  res.status(201).json({
    success: true,
    data: restaurant,
  });
});

export const updateRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.update(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: restaurant,
  });
});

export const deleteRestaurant = asyncHandler(async (req, res) => {
  await restaurantService.remove(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Restaurant deleted',
  });
});
