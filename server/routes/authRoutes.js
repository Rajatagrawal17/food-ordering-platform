import { Router } from 'express';
import { login, logout, me, refreshAccessToken, register, forgotPassword, resetPassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, refreshTokenSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/authValidator.js';
import { auditMiddleware } from '../middleware/audit.js';

const router = Router();

router.post('/register', validate(registerSchema), auditMiddleware('USER_REGISTER'), register);
router.post('/login', validate(loginSchema), auditMiddleware('USER_LOGIN'), login);
router.post('/logout', auditMiddleware('USER_LOGOUT'), logout);
router.post('/refresh', validate(refreshTokenSchema), refreshAccessToken);
router.get('/me', authenticate, me);
router.post('/forgot-password', validate(forgotPasswordSchema), auditMiddleware('FORGOT_PASSWORD'), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), auditMiddleware('RESET_PASSWORD'), resetPassword);

export default router;