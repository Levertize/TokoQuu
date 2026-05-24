import { Router } from 'express';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  cancelTransaction,
  checkoutSchema
} from '../controllers/transactionController.js';
import { validateBody } from '../middleware/validate.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * Transaction routing module.
 * Manages POS sales checkouts, logs list, transaction detail receipts, and voids.
 */

// GET /api/transactions
router.get('/', authenticateToken, getTransactions);

// GET /api/transactions/:id
router.get('/:id', authenticateToken, getTransactionById);

// POST /api/transactions (Checkout)
router.post('/', authenticateToken, validateBody(checkoutSchema), createTransaction);

// PATCH /api/transactions/:id/cancel (Void/Cancel)
router.patch('/:id/cancel', authenticateToken, cancelTransaction);

export default router;
