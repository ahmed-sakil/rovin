import { Router } from 'express';
import {
  getProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
} from '../controllers/productController.js';
import { authenticateUser, requireRole } from '../middlewares/auth.js';

const router = Router();

// Public: view products & filter
router.get('/', getProducts);
router.get('/:idOrSlug', getProductByIdOrSlug);

// Admin-Only: CRUD & Stock Control
router.post('/', authenticateUser, requireRole(['ADMIN', 'STAFF']), createProduct);
router.put('/:id', authenticateUser, requireRole(['ADMIN', 'STAFF']), updateProduct);
router.delete('/:id', authenticateUser, requireRole(['ADMIN']), deleteProduct);
router.post('/:id/stock', authenticateUser, requireRole(['ADMIN', 'STAFF']), adjustStock);

export default router;
