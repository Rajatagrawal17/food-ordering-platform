import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { cacheMiddleware, clearCache } from '../middleware/cache.js';
import {
  createRestaurant,
  deleteRestaurant,
  getRestaurantById,
  listRestaurants,
  updateRestaurant,
} from '../controllers/restaurantController.js';

const router = Router();

router.get('/', cacheMiddleware(300), listRestaurants);
router.get('/:id', cacheMiddleware(300), getRestaurantById);

// Admin endpoints
router.post('/', authenticate, authorize('admin'), clearCache('cache:*restaurants*'), createRestaurant);
router.patch('/:id', authenticate, authorize('admin'), clearCache('cache:*restaurants*'), updateRestaurant);
router.delete('/:id', authenticate, authorize('admin'), clearCache('cache:*restaurants*'), deleteRestaurant);

export default router;
