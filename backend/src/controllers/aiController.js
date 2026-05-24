import { z } from 'zod';
import { getAiResponse } from '../services/aiService.js';
import db from '../db/connection.js';

export const chatSchema = z.object({
  message: z.string().min(1, 'Pesan tidak boleh kosong'),
  history: z.array(
    z.object({
      role: z.enum(['user', 'model', 'assistant']),
      text: z.string()
    })
  ).optional().default([])
});

/**
 * Handles chat communication with Gemini/Ollama.
 * Sends real-time SQLite data context alongside the messages.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} Response JSON
 */
export async function chat(req, res, next) {
  try {
    const { message, history } = req.body;

    const responseText = await getAiResponse(message, history);

    return res.status(200).json({
      success: true,
      response: responseText
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Compiles dynamic suggested prompts for the user based on database state.
 * Returns contextual queries like "restock warnings" or "sales performance".
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} Response JSON
 */
export async function getSuggestions(req, res, next) {
  try {
    const suggestions = ['Bagaimana ringkasan penjualan toko hari ini?'];

    // Check low stock
    const lowStockCountRes = await db('products')
      .where('stock', '<=', db.ref('min_stock'))
      .where('is_active', 1)
      .count('id as count')
      .first();

    if (lowStockCountRes && lowStockCountRes.count > 0) {
      suggestions.push('Produk apa saja yang stoknya menipis dan butuh restok?');
    } else {
      suggestions.push('Apa saja produk terlaris minggu ini?');
    }

    suggestions.push('Bagaimana rekomendasi praktis untuk menaikkan keuntungan toko?');

    return res.status(200).json({
      success: true,
      suggestions
    });
  } catch (err) {
    next(err);
  }
}
