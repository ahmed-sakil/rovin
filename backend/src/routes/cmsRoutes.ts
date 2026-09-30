import { Router } from 'express';
import {
  getSiteContent,
  updateSiteContent,
  getAllSiteContent,
  submitContactMessage,
  getContactMessages,
  updateContactStatus,
} from '../controllers/cmsController.js';
import { authenticateUser, requireRole } from '../middlewares/auth.js';

const router = Router();

// Public CMS Content & Contact
router.get('/pages/:slug', getSiteContent);
router.post('/contact', submitContactMessage);

// Admin-Only Content & Inquiries
router.get('/pages', authenticateUser, requireRole(['ADMIN']), getAllSiteContent);
router.put('/pages/:slug', authenticateUser, requireRole(['ADMIN']), updateSiteContent);
router.get('/messages', authenticateUser, requireRole(['ADMIN']), getContactMessages);
router.put('/messages/:id', authenticateUser, requireRole(['ADMIN']), updateContactStatus);

export default router;
