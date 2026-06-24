import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { reviewSchema } from '../validators/reviewValidator.js';
import { createReview, featuredReviews, listReviewsByFood } from '../controllers/reviewController.js';

const router = Router();

router.get('/featured', featuredReviews);
router.get('/food/:foodId', listReviewsByFood);
router.post('/', authenticate, authorize('customer', 'admin'), validate(reviewSchema), createReview);

export default router;