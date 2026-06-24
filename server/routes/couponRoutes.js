import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validateCoupon } from '../controllers/couponController.js';

const router = Router();

router.post('/validate', authenticate, validateCoupon);

export default router;
