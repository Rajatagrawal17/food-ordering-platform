import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createPaymentIntentSchema, failureSchema, verifyPaymentSchema } from '../validators/paymentValidator.js';
import { createPaymentIntent, processDummyUPI, paymentFailure, verifyPayment, handleWebhook } from '../controllers/paymentController.js';

const router = Router();

router.post('/create-order', authenticate, validate(createPaymentIntentSchema), createPaymentIntent);
router.post('/dummy-upi', authenticate, processDummyUPI);
router.post('/verify', authenticate, validate(verifyPaymentSchema), verifyPayment);
router.post('/failure', authenticate, validate(failureSchema), paymentFailure);
router.post('/webhook', handleWebhook);

export default router;