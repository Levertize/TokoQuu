import db from './connection.js';

/**
 * Initializes the database schemas if they do not exist in the database.
 * Creates tables for products, users, transactions, transaction_items, and stock_logs.
 * @returns {Promise<void>}
 */
export async function initDb() {
  console.log('Initializing database schema...');

  // 1. Products Table
  if (!(await db.schema.hasTable('products'))) {
    await db.schema.createTable('products', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('category').notNullable();
      table.integer('buy_price').notNullable();
      table.integer('sell_price').notNullable();
      table.integer('stock').notNullable().defaultTo(0);
      table.integer('min_stock').notNullable().defaultTo(10);
      table.string('unit').notNullable().defaultTo('pcs');
      table.string('barcode').nullable();
      table.string('image_url').nullable();
      table.string('emoji').nullable().defaultTo('📦');
      table.integer('is_active').notNullable().defaultTo(1); // soft delete support
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });
    console.log('Table "products" initialized.');
  }

  // 2. Users Table
  if (!(await db.schema.hasTable('users'))) {
    await db.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('username').notNullable().unique();
      table.string('password').notNullable(); // bcrypt hash
      table.string('full_name').notNullable();
      table.string('role').notNullable().defaultTo('cashier'); // 'admin' | 'cashier'
      table.integer('is_active').notNullable().defaultTo(1);
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('Table "users" initialized.');
  }

  // 3. Transactions Table
  if (!(await db.schema.hasTable('transactions'))) {
    await db.schema.createTable('transactions', (table) => {
      table.increments('id').primary();
      table.string('invoice_number').notNullable().unique(); // Format: TRX-YYYYMMDD-XXXX
      table.integer('total_amount').notNullable();
      table.integer('discount').notNullable().defaultTo(0);
      table.integer('tax').notNullable().defaultTo(0);
      table.string('payment_method').notNullable().defaultTo('cash'); // 'cash' | 'qris' | 'transfer'
      table.integer('payment_amount').notNullable();
      table.integer('change_amount').notNullable().defaultTo(0);
      table.string('cashier_name').nullable();
      table.string('customer_name').nullable();
      table.text('notes').nullable();
      table.string('status').notNullable().defaultTo('completed'); // 'completed' | 'cancelled'
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('Table "transactions" initialized.');
  }

  // 4. Transaction Items Table
  if (!(await db.schema.hasTable('transaction_items'))) {
    await db.schema.createTable('transaction_items', (table) => {
      table.increments('id').primary();
      table.integer('transaction_id').notNullable().references('id').inTable('transactions').onDelete('CASCADE');
      table.integer('product_id').notNullable().references('id').inTable('products');
      table.string('product_name').notNullable(); // snapshot of name at purchase
      table.integer('quantity').notNullable();
      table.integer('unit_price').notNullable(); // snapshot of price at purchase
      table.integer('subtotal').notNullable();
    });
    console.log('Table "transaction_items" initialized.');
  }

  // 5. Stock Logs Table
  if (!(await db.schema.hasTable('stock_logs'))) {
    await db.schema.createTable('stock_logs', (table) => {
      table.increments('id').primary();
      table.integer('product_id').notNullable().references('id').inTable('products');
      table.string('type').notNullable(); // 'sale' | 'restock' | 'adjustment' | 'return'
      table.integer('quantity').notNullable(); // positive or negative
      table.text('notes').nullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('Table "stock_logs" initialized.');
  }

  console.log('Database schema initialization complete.');
}
