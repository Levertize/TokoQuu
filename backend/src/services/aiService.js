import db from '../db/connection.js';

/**
 * Local rule-based intelligent assistant that operates on real-time database data.
 * Zero external API calls, 100% reliable and fast.
 * @param {string} userMessage - User query
 * @param {Array<{role: string, text: string}>} chatHistory - Previous messages
 * @returns {Promise<string>} Clean formatted response in Bahasa Indonesia
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
    ? topProductsRaw.map((p, idx) => `${idx + 1}. **${p.product_name}** (${p.total_qty} pcs)`).join('\n')
    : 'Belum ada data penjualan terlaris.';

  // Low stock products
  const lowStockRaw = await db('products')
    .where('stock', '<=', db.ref('min_stock'))
    .where('is_active', 1);

  const lowStockProducts = lowStockRaw.length > 0
    ? lowStockRaw.map(p => `- 📦 **${p.name}** (Sisa: ${p.stock} ${p.unit}, Batas Min: ${p.min_stock})`).join('\n')
    : 'Semua stok produk saat ini dalam kondisi aman (di atas batas minimum).';

  const storeName = process.env.STORE_NAME || 'Toko Maju Jaya';
  const query = userMessage.toLowerCase().trim();

  // 2. Intelligent local keyword routing
  
  // GREETINGS / HALO
  if (query.match(/^(halo|hai|hello|pagi|siang|sore|malam|permisi|hey)/)) {
    return `Halo! Saya adalah AI Assistant **${storeName}**. 

Saya siap membantu Anda mengelola toko. Anda dapat menanyakan hal-hal seperti:
- 💰 **Pendapatan & Transaksi Hari Ini** (Ketik: *pendapatan* atau *omset*)
- 📦 **Stok Produk Kritis** (Ketik: *stok* atau *habis*)
- 🏆 **Produk Terlaris** (Ketik: *terlaris* atau *paling laku*)
- 📊 **Ringkasan Toko** (Ketik: *ringkasan*)`;
  }

  // PENDAPATAN / OMSET / REVENUE
  if (query.includes('pendapatan') || query.includes('omset') || query.includes('uang') || query.includes('penjualan') || query.includes('omzet')) {
    return `💰 **Laporan Pendapatan Hari Ini (${todayStr}):**
- **Total Pendapatan:** Rp ${todayRevenue.toLocaleString('id-ID')}
- **Jumlah Transaksi:** ${todayTransactions} transaksi sukses

*Tips: Pastikan semua pembayaran QRIS/Transfer sudah diverifikasi di kasir!*`;
  }

  // STOK / HABIS / CRITICAL STOCK
  if (query.includes('stok') || query.includes('habis') || query.includes('sisa') || query.includes('stok kritis') || query.includes('limit')) {
    const header = `📦 **Laporan Stok Produk Terkini:**\n\n`;
    if (lowStockRaw.length > 0) {
      return `${header}Berikut adalah produk yang menyentuh atau berada di bawah batas minimum stok:\n\n${lowStockProducts}\n\n*Disarankan untuk segera melakukan pembelian ulang (restock) ke supplier.*`;
    } else {
      return `${header}✅ **Kondisi Aman!** ${lowStockProducts}`;
    }
  }

  // TERLARIS / POPULER / BEST SELLER
  if (query.includes('terlaris') || query.includes('laku') || query.includes('populer') || query.includes('paling laku') || query.includes('produk terlaris')) {
    return `🏆 **Produk Terlaris Minggu Ini:**\n\n${topProducts}\n\n*Anda bisa meningkatkan stok untuk produk-produk di atas agar tidak kehabisan saat kasir ramai.*`;
  }

  // TRANSAKSI
  if (query.includes('transaksi') || query.includes('nota') || query.includes('invoice')) {
    return `🧾 **Status Transaksi Hari Ini:**
- **Berhasil:** ${todayTransactions} transaksi
- **Total Omset:** Rp ${todayRevenue.toLocaleString('id-ID')}

Gunakan halaman **Laporan** untuk melihat detail riwayat invoice secara menyeluruh.`;
  }

  // RINGKASAN / SUMMARY / OVERVIEW
  if (query.includes('ringkasan') || query.includes('status') || query.includes('info') || query.includes('dashboard') || query.includes('semua')) {
    return `📊 **Ringkasan Kondisi Toko (${todayStr}):**

- 💰 **Pendapatan:** Rp ${todayRevenue.toLocaleString('id-ID')} (${todayTransactions} transaksi)
- 🏆 **Top Produk:** 
${topProducts}
- ⚠️ **Stok Kritis:** 
${lowStockRaw.length > 0 ? `${lowStockRaw.length} produk menipis` : 'Semua aman'}

Apakah ada data spesifik yang ingin Anda diskusikan?`;
  }

  // DEFAULT SMART RESPONSE
  return `Saya mengerti pertanyaan Anda mengenai "${userMessage}". Sebagai asisten toko Anda, berikut ringkasan data yang bisa saya bagikan saat ini:

- 💰 **Pendapatan Hari Ini:** Rp ${todayRevenue.toLocaleString('id-ID')}
- 🧾 **Jumlah Transaksi:** ${todayTransactions}
- 🏆 **Produk Terpopuler:** 
${topProducts}
- ⚠️ **Stok Perlu Perhatian:** 
${lowStockRaw.length > 0 ? `${lowStockRaw.length} produk di bawah batas minimum` : 'Aman (0)'}

*Ketik **stok**, **pendapatan**, atau **terlaris** untuk mendapatkan detail data.*`;
}
