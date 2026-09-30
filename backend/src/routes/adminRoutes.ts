import { Router } from 'express';
import { getDashboardStats, getSettings, updateSettings } from '../controllers/adminController.js';
import { authenticateUser, requireRole } from '../middlewares/auth.js';

const router = Router();

// Admin telemetry & visualization stats
router.get('/stats', authenticateUser, requireRole(['ADMIN', 'STAFF']), getDashboardStats);

// System Settings & Delivery Charges
router.get('/settings', getSettings);
router.put('/settings', authenticateUser, requireRole(['ADMIN']), updateSettings);

export default router;
