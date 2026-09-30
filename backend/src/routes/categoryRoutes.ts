import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  deleteSubcategory,
} from '../controllers/categoryController.js';
import { authenticateUser, requireRole } from '../middlewares/auth.js';

const router = Router();

// Public: view categories
router.get('/', getCategories);

// Admin-Only: CRUD
router.post('/', authenticateUser, requireRole(['ADMIN', 'STAFF']), createCategory);
router.put('/:id', authenticateUser, requireRole(['ADMIN', 'STAFF']), updateCategory);
router.delete('/:id', authenticateUser, requireRole(['ADMIN']), deleteCategory);

router.post('/subcategories', authenticateUser, requireRole(['ADMIN', 'STAFF']), createSubcategory);
router.delete('/subcategories/:id', authenticateUser, requireRole(['ADMIN']), deleteSubcategory);

export default router;
