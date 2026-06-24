import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { addAddress, deleteAddress, updateAddress, updateProfile } from '../controllers/profileController.js';
import { auditMiddleware } from '../middleware/audit.js';

const router = Router();

router.use(authenticate);

router.put('/', auditMiddleware('PROFILE_UPDATE'), updateProfile);
router.post('/addresses', auditMiddleware('ADDRESS_ADD'), addAddress);
router.put('/addresses/:index', auditMiddleware('ADDRESS_UPDATE'), updateAddress);
router.delete('/addresses/:index', auditMiddleware('ADDRESS_DELETE'), deleteAddress);

export default router;
