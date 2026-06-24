import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { addToWishlist, getWishlist, removeFromWishlist } from '../controllers/wishlistController.js';

const router = Router();

router.use(authenticate);

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:foodId', removeFromWishlist);

export default router;
