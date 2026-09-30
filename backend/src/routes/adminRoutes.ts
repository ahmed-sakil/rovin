import { Router } from 'express';
import {
  getDashboardStats,
  getSettings,
  updateSettings,
  getUsers,
  banUser,
  unbanUser,
  punishUser,
  getAuditLogs,
} from '../controllers/adminController.js';
import { authenticateUser, requireRole } from '../middlewares/auth.js';

const router = Router();

// Dashboard Telemetry & Stats
router.get('/stats', authenticateUser, requireRole(['ADMIN', 'STAFF']), getDashboardStats);

// System Settings & Delivery Charges
router.get('/settings', getSettings);
router.put('/settings', authenticateUser, requireRole(['ADMIN']), updateSettings);

// User Management & Disciplinary Actions
router.get('/users', authenticateUser, requireRole(['ADMIN', 'STAFF']), getUsers);
router.post('/users/:id/ban', authenticateUser, requireRole(['ADMIN']), banUser);
router.post('/users/:id/unban', authenticateUser, requireRole(['ADMIN']), unbanUser);
router.post('/users/:id/punish', authenticateUser, requireRole(['ADMIN']), punishUser);

// Security Audit Log Feed
router.get('/audit-logs', authenticateUser, requireRole(['ADMIN', 'STAFF']), getAuditLogs);

export default router;
