import { Router } from 'express';
import {
  getProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getProductReviews,
  createProductReview,
} from '../controllers/productController.js';
import { authenticateUser, requireRole } from '../middlewares/auth.js';
import { reviewLimiter } from '../middlewares/rateLimiters.js';

const router = Router();

// Public: view products & filter
router.get('/', getProducts);
router.get('/:idOrSlug', getProductByIdOrSlug);

// Reviews (Public Read, Authenticated Write)
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', authenticateUser, reviewLimiter, createProductReview);

// Admin-Only: CRUD & Stock Control
router.post('/', authenticateUser, requireRole(['ADMIN', 'STAFF']), createProduct);
router.put('/:id', authenticateUser, requireRole(['ADMIN', 'STAFF']), updateProduct);
router.delete('/:id', authenticateUser, requireRole(['ADMIN']), deleteProduct);
router.post('/:id/stock', authenticateUser, requireRole(['ADMIN', 'STAFF']), adjustStock);

export default router;
