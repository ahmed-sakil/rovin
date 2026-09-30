import { Router } from 'express';
import {
  createOrder,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  validateCoupon,
} from '../controllers/orderController.js';
import { authenticateUser, requireRole } from '../middlewares/auth.js';

const router = Router();

// Public: Create order & Validate Coupon & Track order
router.post('/checkout', createOrder);
router.post('/validate-coupon', validateCoupon);
router.get('/track/:orderNumberOrId', getOrder);

// Admin-Only: Order Management
router.get('/', authenticateUser, requireRole(['ADMIN', 'STAFF']), getAllOrders);
router.get('/:orderNumberOrId', authenticateUser, requireRole(['ADMIN', 'STAFF']), getOrder);
router.put('/:id/status', authenticateUser, requireRole(['ADMIN', 'STAFF']), updateOrderStatus);

export default router;
