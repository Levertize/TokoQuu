import { Router } from 'express';
import {
  getSummary,
  getDailyReport,
  getMonthlyReport,
  getTopProducts,
  getLowStockProducts,
  getHourlyReport
} from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * Report routing module.
 * Outputs analytical insights including today summaries, daily/monthly curves, and top products.
 */

// GET /api/reports/summary
router.get('/summary', authenticateToken, getSummary);

// GET /api/reports/daily
router.get('/daily', authenticateToken, getDailyReport);

// GET /api/reports/monthly
router.get('/monthly', authenticateToken, getMonthlyReport);

// GET /api/reports/top-products
router.get('/top-products', authenticateToken, getTopProducts);

// GET /api/reports/low-stock
router.get('/low-stock', authenticateToken, getLowStockProducts);

// GET /api/reports/hourly
router.get('/hourly', authenticateToken, getHourlyReport);

export default router;
