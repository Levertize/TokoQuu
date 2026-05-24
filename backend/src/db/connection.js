import knex from 'knex';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load env from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const dbPath = process.env.DB_PATH || './database.db';

/**
 * Knex database connection instance configured for SQLite (better-sqlite3).
 */
const db = knex({
  client: 'better-sqlite3',
  connection: {
    filename: dbPath
  },
  useNullAsDefault: true
});

export default db;
