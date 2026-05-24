import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  createProductSchema,
  updateProductSchema,
  updateStockSchema
} from '../controllers/productController.js';
import { validateBody } from '../middleware/validate.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * Product routing module for managing inventory catalog.
 * Authenticated users can list products, modify items, and restock.
 */

// GET /api/products
router.get('/', authenticateToken, getProducts);

// GET /api/products/:id
router.get('/:id', authenticateToken, getProductById);

// POST /api/products
router.post('/', authenticateToken, validateBody(createProductSchema), createProduct);

// PUT /api/products/:id
router.put('/:id', authenticateToken, validateBody(updateProductSchema), updateProduct);

// DELETE /api/products/:id
router.delete('/:id', authenticateToken, deleteProduct);

// PATCH /api/products/:id/stock
router.patch('/:id/stock', authenticateToken, validateBody(updateStockSchema), updateStock);

export default router;
