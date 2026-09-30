import { Router } from 'express';
import multer from 'multer';
import { uploadSingleFile } from '../controllers/uploadController.js';
import { authenticateUser, requireRole } from '../middlewares/auth.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Single image upload with metadata extraction
router.post('/single', authenticateUser, requireRole(['ADMIN', 'STAFF', 'CUSTOMER']), upload.single('image'), uploadSingleFile);

export default router;
