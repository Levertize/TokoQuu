import { Router } from 'express';
import { chat, getSuggestions, chatSchema } from '../controllers/aiController.js';
import { validateBody } from '../middleware/validate.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * AI assistant routing module.
 * Feeds chat conversations and dynamic suggested prompts back to the UI.
 */

// POST /api/ai/chat
router.post('/chat', authenticateToken, validateBody(chatSchema), chat);

// GET /api/ai/suggestions
router.get('/suggestions', authenticateToken, getSuggestions);

export default router;
