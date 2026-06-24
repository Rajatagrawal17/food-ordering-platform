import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { cartUpdateSchema, cartItemIdSchema } from '../validators/cartValidator.js';
import { clearCart, getCart, removeCartItem, updateCartItem } from '../controllers/cartController.js';

const router = Router();

router.get('/', authenticate, getCart);
router.put('/', authenticate, validate(cartUpdateSchema), updateCartItem);
router.delete('/items/:itemId', authenticate, validate(cartItemIdSchema), removeCartItem);
router.delete('/', authenticate, clearCart);

export default router;