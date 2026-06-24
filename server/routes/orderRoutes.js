import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { orderStatusSchema } from '../validators/orderValidator.js';
import { getOrderById, listOrders, updateOrderStatus } from '../controllers/orderController.js';

const router = Router();

router.get('/', authenticate, listOrders);
router.get('/:id', authenticate, getOrderById);
router.patch('/:id/status', authenticate, authorize('admin'), validate(orderStatusSchema), updateOrderStatus);

export default router;