import { z } from 'zod';
import db from '../db/connection.js';
import { generateInvoiceNumber } from '../utils/invoice.js';

export const checkoutSchema = z.object({
  items: z.array(
    z.object({
      product_id: z.number().int().min(1, 'ID produk tidak valid'),
      quantity: z.number().int().min(1, 'Jumlah produk minimal 1')
    })
  ).min(1, 'Keranjang belanja tidak boleh kosong'),
  discount: z.number().int().min(0).default(0),
  tax: z.number().int().min(0).default(0),
  payment_method: z.enum(['cash', 'qris', 'transfer'], { message: 'Metode pembayaran tidak valid' }),
  payment_amount: z.number().int().min(0, 'Jumlah pembayaran tidak boleh negatif'),
  customer_name: z.string().optional().default('Umum'),
  notes: z.string().nullable().optional()
});

/**
 * Gets all transactions. Supports filtering by date and status.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} Response JSON
 */
export async function getTransactions(req, res, next) {
  try {
    const { date, status } = req.query;

    let query = db('transactions');

    if (date) {
      query = query.where('created_at', 'like', `${date}%`);
    }

    if (status) {
      query = query.where('status', status);
    }

    const transactions = await query.orderBy('created_at', 'desc');

    return res.status(200).json({
      success: true,
      data: transactions
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Gets the details of a single transaction including all purchased items.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} Response JSON
 */
export async function getTransactionById(req, res, next) {
  try {
    const { id } = req.params;

    const transaction = await db('transactions')
      .where('id', id)
      .first();

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaksi tidak ditemukan!'
      });
    }

    const items = await db('transaction_items')
      .where('transaction_id', id);

    return res.status(200).json({
      success: true,
      data: {
        ...transaction,
        items
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Process a new sale transaction (POS Checkout).
 * Validates stock, calculates totals, deducts stock, logs action in SQLite transaction.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} Response JSON
 */
export async function createTransaction(req, res, next) {
  let trx;
  try {
    const {
      items,
      discount,
      tax,
      payment_method,
      payment_amount,
      customer_name,
      notes
    } = req.body;

    trx = await db.transaction();

    // 1. Validate all products and stock availability
    const itemsWithDetails = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const product = await trx('products')
        .where({ id: item.product_id, is_active: 1 })
        .forUpdate() // lock for writing in transaction
        .first();

      if (!product) {
        throw new Error(`Produk dengan ID ${item.product_id} tidak ditemukan atau tidak aktif!`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Stok produk "${product.name}" tidak mencukupi! Tersedia: ${product.stock}, diminta: ${item.quantity}`);
      }

      const itemSubtotal = product.sell_price * item.quantity;
      calculatedSubtotal += itemSubtotal;

      itemsWithDetails.push({
        product_id: product.id,
        name: product.name,
        quantity: item.quantity,
        unit_price: product.sell_price,
        subtotal: itemSubtotal
      });
    }

    const totalAmount = calculatedSubtotal - discount + tax;
    const changeAmount = payment_amount - totalAmount;

    if (changeAmount < 0) {
      throw new Error(`Uang pembayaran kurang! Dibutuhkan: Rp ${totalAmount.toLocaleString('id-ID')}, Dibayar: Rp ${payment_amount.toLocaleString('id-ID')}`);
    }

    // 2. Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();
    const cashierName = req.user ? req.user.full_name : 'Admin Toko';

    // 3. Insert transaction
    const [transactionId] = await trx('transactions').insert({
      invoice_number: invoiceNumber,
      total_amount: totalAmount,
      discount,
      tax,
      payment_method,
      payment_amount,
      change_amount: changeAmount,
      cashier_name: cashierName,
      customer_name: customer_name || 'Umum',
      notes: notes || null,
      status: 'completed',
      created_at: db.fn.now() // uses standard SQLite datetime('now')
    });

    // 4. Insert items and update product stocks + write stock logs
    for (const item of itemsWithDetails) {
      // Insert item detail
      await trx('transaction_items').insert({
        transaction_id: transactionId,
        product_id: item.product_id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal
      });

      // Decrement stock
      await trx('products')
        .where('id', item.product_id)
        .decrement('stock', item.quantity)
        .update({ updated_at: db.fn.now() });

      // Add stock log
      await trx('stock_logs').insert({
        product_id: item.product_id,
        type: 'sale',
        quantity: -item.quantity,
        notes: `Penjualan Kasir - Invoice ${invoiceNumber}`
      });
    }

    await trx.commit();

    // Fetch the final transaction object with items to send back
    const transaction = await db('transactions').where('id', transactionId).first();
    const transactionItems = await db('transaction_items').where('transaction_id', transactionId);

    return res.status(201).json({
      success: true,
      data: {
        ...transaction,
        items: transactionItems
      },
      message: 'Transaksi berhasil diselesaikan!'
    });
  } catch (err) {
    if (trx) await trx.rollback();
    // Wrap error messages neatly for the error handler
    res.status(400);
    next(err);
  }
}

/**
 * Cancels an existing transaction (voids the purchase).
 * Restores product stock levels and records return stock logs inside a transaction.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} Response JSON
 */
export async function cancelTransaction(req, res, next) {
  let trx;
  try {
    const { id } = req.params;

    trx = await db.transaction();

    const transaction = await trx('transactions')
      .where('id', id)
      .forUpdate()
      .first();

    if (!transaction) {
      throw new Error('Transaksi tidak ditemukan!');
    }

    if (transaction.status === 'cancelled') {
      throw new Error('Transaksi sudah dibatalkan sebelumnya!');
    }

    // 1. Update status to cancelled
    await trx('transactions')
      .where('id', id)
      .update({ status: 'cancelled' });

    // 2. Fetch items to restore stock
    const items = await trx('transaction_items')
      .where('transaction_id', id);

    for (const item of items) {
      // Increment stock
      await trx('products')
        .where('id', item.product_id)
        .increment('stock', item.quantity)
        .update({ updated_at: db.fn.now() });

      // Add stock log
      await trx('stock_logs').insert({
        product_id: item.product_id,
        type: 'return',
        quantity: item.quantity,
        notes: `Pembatalan Transaksi - Invoice ${transaction.invoice_number}`
      });
    }

    await trx.commit();

    return res.status(200).json({
      success: true,
      message: 'Transaksi berhasil dibatalkan dan stok dikembalikan!'
    });
  } catch (err) {
    if (trx) await trx.rollback();
    res.status(400);
    next(err);
  }
}
