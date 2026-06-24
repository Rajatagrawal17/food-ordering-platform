import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { getOverview, listOrders, listUsers, getAnalytics, exportRevenue, exportSales } from '../controllers/adminController.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = Router();

router.use(authenticate, authorize('admin'));
router.get('/overview', cacheMiddleware(600), getOverview);
router.get('/analytics', cacheMiddleware(600), getAnalytics);
router.get('/reports/revenue', exportRevenue);
router.get('/reports/sales', exportSales);
router.get('/users', listUsers);
router.get('/orders', listOrders);

export default router;