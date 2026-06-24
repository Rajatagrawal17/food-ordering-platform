import { Router } from 'express';
import { getCsrfToken } from '../controllers/securityController.js';
import { csrfProtection } from '../middleware/csrf.js';

const router = Router();

router.get('/csrf-token', csrfProtection, getCsrfToken);

export default router;