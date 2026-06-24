import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { upload } from '../middleware/upload.js';
import { uploadImage } from '../controllers/uploadController.js';

const router = Router();

router.post('/image', authenticate, authorize('admin'), upload.single('image'), uploadImage);

export default router;