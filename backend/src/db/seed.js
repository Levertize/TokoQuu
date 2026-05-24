import bcrypt from 'bcryptjs';
import db from './connection.js';

const initialProducts = [
  { name: 'Aqua 600ml', category: 'Minuman', buy_price: 2500, sell_price: 4000, stock: 8, min_stock: 10, emoji: '💧', unit: 'pcs' },
  { name: 'Mie Goreng', category: 'Makanan', buy_price: 2000, sell_price: 3500, stock: 3, min_stock: 5, emoji: '🍜', unit: 'pcs' },
  { name: 'Teh Botol', category: 'Minuman', buy_price: 3000, sell_price: 5000, stock: 24, min_stock: 10, emoji: '🍵', unit: 'pcs' },
  { name: 'Susu UHT', category: 'Minuman', buy_price: 4000, sell_price: 6500, stock: 2, min_stock: 5, emoji: '🥛', unit: 'pcs' },
  { name: 'Chitato', category: 'Snack', buy_price: 5000, sell_price: 8000, stock: 32, min_stock: 15, emoji: '🍟', unit: 'pcs' },
  { name: 'Roti Tawar', category: 'Makanan', buy_price: 8000, sell_price: 12000, stock: 15, min_stock: 10, emoji: '🍞', unit: 'pcs' },
  { name: 'Indomie Goreng', category: 'Makanan', buy_price: 2000, sell_price: 3000, stock: 48, min_stock: 20, emoji: '🍲', unit: 'pcs' },
  { name: 'Kopi Sachet', category: 'Minuman', buy_price: 1500, sell_price: 2500, stock: 60, min_stock: 15, emoji: '☕', unit: 'pcs' },
  { name: 'Sabun Mandi', category: 'Kebutuhan Rumah', buy_price: 6000, sell_price: 8500, stock: 20, min_stock: 8, emoji: '🧼', unit: 'pcs' }
];

/**
 * Seeds the SQLite database with default mock data if empty.
 * @returns {Promise<void>}
 */
export async function seedDb() {
  console.log('Checking if database needs seeding...');

  // 1. Seed Users Table
  const userCount = await db('users').count('id as count').first();
  if (userCount.count === 0) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    await db('users').insert({
      username: 'admin',
      password: hashedPassword,
      full_name: 'Admin Toko',
      role: 'admin',
      is_active: 1
    });
    console.log('Seeded default admin user (username: "admin", password: "password123").');
  }

  // 2. Seed Products Table
  const productCount = await db('products').count('id as count').first();
  if (productCount.count === 0) {
    await db('products').insert(initialProducts);
    console.log('Seeded initial products catalog.');

    // Seed stock logs for initial stock levels
    const products = await db('products').select('id', 'stock');
    const logs = products.map((p) => ({
      product_id: p.id,
      type: 'restock',
      quantity: p.stock,
      notes: 'Stok awal pembangunan database'
    }));
    await db('stock_logs').insert(logs);
  }

  // 3. Seed Transactions Table (to populate charts on first run)
  const txCount = await db('transactions').count('id as count').first();
  if (txCount.count === 0) {
    console.log('Seeded initial transaction history for reporting charts...');
    
    const today = new Date();
    const mockTxs = [];
    const mockTxItems = [];

    // Let's create transactions for the last 7 days to seed chart stats
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      
      // Add 2 mock transactions per day
      for (let j = 1; j <= 2; j++) {
        const invoiceNum = `TRX-${dateStr.replace(/-/g, '')}-${String(j).padStart(4, '0')}`;
        const total = 12000 + Math.floor(Math.random() * 80000);
        const method = j === 1 ? 'cash' : 'qris';
        const txId = i * 2 + j;

        mockTxs.push({
          id: txId,
          invoice_number: invoiceNum,
          total_amount: total,
          discount: 0,
          tax: Math.round(total * 0.11),
          payment_method: method,
          payment_amount: total,
          change_amount: 0,
          cashier_name: 'Admin Toko',
          customer_name: 'Umum',
          notes: 'Transaksi awal pengembangan',
          status: 'completed',
          created_at: `${dateStr} ${10 + j * 4}:15:00`
        });

        // Insert items into mock transaction
        mockTxItems.push({
          transaction_id: txId,
          product_id: 1, // Aqua
          product_name: 'Aqua 600ml',
          quantity: 2,
          unit_price: 4000,
          subtotal: 8000
        });
      }
    }
    
    await db('transactions').insert(mockTxs);
    await db('transaction_items').insert(mockTxItems);
    console.log('Transaction seeding completed.');
  }

  console.log('Database seeding check complete.');
}
