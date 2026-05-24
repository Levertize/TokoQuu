import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import db from '../db/connection.js';

/**
 * Gathers real-time database context (revenue, critical stock, popular items)
 * and sends it to Gemini API or Ollama.
 * @param {string} userMessage - User query
 * @param {Array<{role: string, text: string}>} chatHistory - Previous messages
 * @returns {Promise<string>} AI text response
 */
export async function getAiResponse(userMessage, chatHistory = []) {
  // 1. Gather context from SQLite database
  const todayStr = new Date().toISOString().slice(0, 10);
  
  // Today's completed transactions
  const todayTxs = await db('transactions')
    .where('created_at', 'like', `${todayStr}%`)
    .where('status', 'completed');
    
  const todayRevenue = todayTxs.reduce((sum, t) => sum + t.total_amount, 0);
  const todayTransactions = todayTxs.length;

  // Top products (last 7 days)
  const topProductsRaw = await db('transaction_items as ti')
    .join('transactions as t', 'ti.transaction_id', 't.id')
    .select('ti.product_name')
    .sum('ti.quantity as total_qty')
    .where('t.status', 'completed')
    .groupBy('ti.product_name')
    .orderBy('total_qty', 'desc')
    .limit(3);
    
  const topProducts = topProductsRaw.length > 0
    ? topProductsRaw.map((p, idx) => `${idx + 1}. ${p.product_name} (${p.total_qty} pcs)`).join('\n')
    : 'Belum ada data penjualan terlaris.';

  // Low stock products
  const lowStockRaw = await db('products')
    .where('stock', '<=', db.ref('min_stock'))
    .where('is_active', 1);
    
  const lowStockProducts = lowStockRaw.length > 0
    ? lowStockRaw.map(p => `- ${p.emoji || '📦'} ${p.name}: sisa ${p.stock} ${p.unit} (min: ${p.min_stock})`).join('\n')
    : 'Semua stok produk saat ini dalam kondisi aman (di atas batas minimum).';

  // Construct System Prompt
  const storeName = process.env.STORE_NAME || 'Toko Maju Jaya';
  const systemPrompt = `Kamu adalah AI assistant untuk toko "${storeName}".
Kamu memiliki akses ke data toko berikut (diambil real-time):

=== DATA TOKO SAAT INI ===
Tanggal: ${todayStr}
Pendapatan hari ini: Rp ${todayRevenue.toLocaleString('id-ID')}
Jumlah transaksi hari ini: ${todayTransactions}

Produk terlaris minggu ini:
${topProducts}

Stok yang perlu diperhatikan (di bawah minimum):
${lowStockProducts}

=== AKHIR DATA ===

Jawab pertanyaan admin dengan ramah, singkat, dan berdasarkan data di atas.
Gunakan Bahasa Indonesia. Jika diminta saran, berikan saran yang praktis dan spesifik.`;

  // 2. Query the AI Provider
  const provider = process.env.AI_PROVIDER || 'gemini';

  if (provider === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // If API key is empty, fail gracefully with instructions
      return `Kunci API Gemini (GEMINI_API_KEY) tidak ditemukan di file konfigurasi .env! Silakan masukkan kunci API Anda di berkas .env untuk mengaktifkan AI Copilot.

*Data Toko Saat Ini:*
- Pendapatan hari ini: Rp ${todayRevenue.toLocaleString('id-ID')}
- Transaksi hari ini: ${todayTransactions}
- Produk Terlaris:\n${topProducts}
- Stok Kritis:\n${lowStockProducts}`;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    
    // Instantiating model with systemInstruction
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      systemInstruction: systemPrompt
    });

    // Format chat history for Gemini SDK
    const history = chatHistory.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
  } else if (provider === 'ollama') {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const ollamaModel = process.env.OLLAMA_MODEL || 'llama3';

    // Format for Ollama chat API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map(h => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.text })),
      { role: 'user', content: userMessage }
    ];

    try {
      const res = await axios.post(`${ollamaUrl}/api/chat`, {
        model: ollamaModel,
        messages,
        stream: false
      }, { timeout: 15000 });
      
      return res.data.message.content;
    } catch (err) {
      throw new Error(`Gagal menghubungi server Ollama lokal: ${err.message}`);
    }
  } else {
    throw new Error(`AI Provider "${provider}" tidak didukung!`);
  }
}
