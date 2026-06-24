import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { foodSchema, foodUpdateSchema } from '../validators/foodValidator.js';
import { createFood, deleteFood, getFoodById, listFoods, updateFood } from '../controllers/foodController.js';
import { cacheMiddleware, clearCache } from '../middleware/cache.js';

const router = Router();

router.get('/', cacheMiddleware(300), listFoods);
router.get('/:id', cacheMiddleware(300), getFoodById);
router.post('/', authenticate, authorize('admin'), validate(foodSchema), clearCache('cache:*foods*'), createFood);
router.patch('/:id', authenticate, authorize('admin'), validate(foodUpdateSchema), clearCache('cache:*foods*'), updateFood);
router.delete('/:id', authenticate, authorize('admin'), clearCache('cache:*foods*'), deleteFood);

export default router;