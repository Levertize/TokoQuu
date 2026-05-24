import { Router } from 'express';
import { login, logout, me, loginSchema } from '../controllers/authController.js';
import { validateBody } from '../middleware/validate.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * Auth routing module for login, logout, and user profile checking.
 */

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), login);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/me
router.get('/me', authenticateToken, me);

export default router;
