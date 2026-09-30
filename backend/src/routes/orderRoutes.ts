import { Router } from 'express';
import {
  createOrder,
  getOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  validateCoupon,
  dispatchToCourier,
  manualConsignmentOverride,
  markLabelPrinted,
} from '../controllers/orderController.js';
import { authenticateUser, requireRole } from '../middlewares/auth.js';

const router = Router();

// Customer Endpoints (Guarded): Create order & View Personal Orders
router.post('/checkout', authenticateUser, createOrder);
router.get('/my-orders', authenticateUser, getMyOrders);

// Public Endpoints: Validate Coupon & Track order
router.post('/validate-coupon', validateCoupon);
router.get('/track/:orderNumberOrId', getOrder);

// Admin-Only: Order Management & Courier Automation
router.get('/', authenticateUser, requireRole(['ADMIN', 'STAFF']), getAllOrders);
router.get('/:orderNumberOrId', authenticateUser, requireRole(['ADMIN', 'STAFF']), getOrder);
router.put('/:id/status', authenticateUser, requireRole(['ADMIN', 'STAFF']), updateOrderStatus);

// Courier Dispatch & Admin Manual Control
router.post('/:id/dispatch', authenticateUser, requireRole(['ADMIN', 'STAFF']), dispatchToCourier);
router.post('/:id/manual-consignment', authenticateUser, requireRole(['ADMIN', 'STAFF']), manualConsignmentOverride);
router.post('/:id/label-printed', authenticateUser, requireRole(['ADMIN', 'STAFF']), markLabelPrinted);

export default router;
