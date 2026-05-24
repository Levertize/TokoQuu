import { z } from 'zod';
import db from '../db/connection.js';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Nama produk harus diisi'),
  category: z.string().min(1, 'Kategori harus diisi'),
  buy_price: z.number().int().min(0, 'Harga beli tidak boleh negatif'),
  sell_price: z.number().int().min(0, 'Harga jual tidak boleh negatif'),
  stock: z.number().int().min(0, 'Stok tidak boleh negatif').default(0),
  min_stock: z.number().int().min(0, 'Min stok tidak boleh negatif').default(10),
  unit: z.string().default('pcs'),
  barcode: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  emoji: z.string().default('📦')
});

export const updateProductSchema = z.object({
  name: z.string().min(1, 'Nama produk harus diisi').optional(),
  category: z.string().min(1, 'Kategori harus diisi').optional(),
  buy_price: z.number().int().min(0, 'Harga beli tidak boleh negatif').optional(),
  sell_price: z.number().int().min(0, 'Harga jual tidak boleh negatif').optional(),
  stock: z.number().int().min(0, 'Stok tidak boleh negatif').optional(),
  min_stock: z.number().int().min(0, 'Min stok tidak boleh negatif').optional(),
  unit: z.string().optional(),
  barcode: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  emoji: z.string().optional()
});

export const updateStockSchema = z.object({
  quantity: z.number().int({ message: 'Kuantitas harus berupa angka bulat' }),
  type: z.enum(['restock', 'adjustment', 'return', 'sale'], { message: 'Tipe log tidak valid' }),
  notes: z.string().optional()
});

/**
 * Gets all active products, supporting filters: search, category, and low stock threshold.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} Response JSON
 */
export async function getProducts(req, res, next) {
  try {
    const { search, category, low_stock } = req.query;

    let query = db('products').where('is_active', 1);

    if (search) {
      query = query.andWhere((builder) => {
        builder.where('name', 'like', `%${search}%`)
          .orWhere('barcode', 'like', `%${search}%`);
      });
    }

    if (category) {
      query = query.where('category', category);
    }

    if (low_stock === 'true') {
      query = query.where('stock', '<=', db.ref('min_stock'));
    }

    // Sort by id descending so newly added products show on top
    const products = await query.orderBy('id', 'desc');

    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Gets a single product by its database ID.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} Response JSON
 */
export async function getProductById(req, res, next) {
  try {
    const { id } = req.params;

    const product = await db('products')
      .where({ id, is_active: 1 })
      .first();

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produk tidak ditemukan!'
      });
    }

    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Adds a new product to the catalog. Initiates stock_logs if initial stock is > 0.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} Response JSON
 */
export async function createProduct(req, res, next) {
  let trx;
  try {
    trx = await db.transaction();

    const productData = req.body;
    
    // Insert new product
    const [insertedId] = await trx('products').insert({
      name: productData.name,
      category: productData.category,
      buy_price: productData.buy_price,
      sell_price: productData.sell_price,
      stock: productData.stock,
      min_stock: productData.min_stock,
      unit: productData.unit,
      barcode: productData.barcode || null,
      image_url: productData.image_url || null,
      emoji: productData.emoji,
      is_active: 1
    });

    // Write log if initial stock is positive
    if (productData.stock > 0) {
      await trx('stock_logs').insert({
        product_id: insertedId,
        type: 'restock',
        quantity: productData.stock,
        notes: 'Stok awal saat pendaftaran produk'
      });
    }

    await trx.commit();

    const createdProduct = await db('products').where('id', insertedId).first();

    return res.status(201).json({
      success: true,
      data: createdProduct,
      message: 'Produk berhasil ditambahkan!'
    });
  } catch (err) {
    if (trx) await trx.rollback();
    next(err);
  }
}

/**
 * Updates properties of an existing product.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} Response JSON
 */
export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingProduct = await db('products')
      .where({ id, is_active: 1 })
      .first();

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Produk tidak ditemukan!'
      });
    }

    const payload = {
      ...updateData,
      updated_at: db.fn.now()
    };

    await db('products')
      .where('id', id)
      .update(payload);

    const updatedProduct = await db('products').where('id', id).first();

    return res.status(200).json({
      success: true,
      data: updatedProduct,
      message: 'Produk berhasil diperbarui!'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Performs soft delete on a product by setting is_active = 0.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} Response JSON
 */
export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;

    const existingProduct = await db('products')
      .where({ id, is_active: 1 })
      .first();

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Produk tidak ditemukan!'
      });
    }

    await db('products')
      .where('id', id)
      .update({
        is_active: 0,
        updated_at: db.fn.now()
      });

    return res.status(200).json({
      success: true,
      message: 'Produk berhasil dihapus!'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Adjusts product stock levels directly (restock/adjustment) and appends a stock log.
 * Runs inside a SQLite transaction.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} Response JSON
 */
export async function updateStock(req, res, next) {
  let trx;
  try {
    const { id } = req.params;
    const { quantity, type, notes } = req.body;

    const existingProduct = await db('products')
      .where({ id, is_active: 1 })
      .first();

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Produk tidak ditemukan!'
      });
    }

    // New stock calculation
    const newStock = existingProduct.stock + quantity;
    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        error: `Stok tidak mencukupi! Stok saat ini: ${existingProduct.stock}`
      });
    }

    trx = await db.transaction();

    // 1. Update product stock
    await trx('products')
      .where('id', id)
      .update({
        stock: newStock,
        updated_at: db.fn.now()
      });

    // 2. Insert stock log
    await trx('stock_logs').insert({
      product_id: id,
      type,
      quantity,
      notes: notes || `Penyesuaian stok manual (${type})`
    });

    await trx.commit();

    return res.status(200).json({
      success: true,
      new_stock: newStock,
      message: 'Stok berhasil diperbarui!'
    });
  } catch (err) {
    if (trx) await trx.rollback();
    next(err);
  }
}
