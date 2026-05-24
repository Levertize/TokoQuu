import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// DB module imports
import { initDb } from './src/db/schema.js';
import { seedDb } from './src/db/seed.js';

// Route imports
import authRoutes from './src/routes/auth.js';
import productRoutes from './src/routes/products.js';
import transactionRoutes from './src/routes/transactions.js';
import reportRoutes from './src/routes/reports.js';
import aiRoutes from './src/routes/ai.js';

// Middleware imports
import { errorHandler } from './src/middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load environment variables from the root folder
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Middlewares
app.use(cors());
app.use(express.json());

// 2. Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);

// Simple root check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'TokoQuu Backend is running!' });
});

// 3. Fallback Global Error Handler
app.use(errorHandler);

/**
 * Initializes the backend server, boots schema and seeds, then starts listening.
 * @returns {Promise<void>}
 */
async function bootstrap() {
  try {
    // 1. Initialize SQLite Database Schema if not exists
    await initDb();
    
    // 2. Seed development dummy records if empty
    await seedDb();

    // 3. Start listening for network requests
    app.listen(PORT, () => {
      console.log(`=============================================`);
      console.log(` TokoQuu API Server is running in ${process.env.NODE_ENV} mode`);
      console.log(` Port: http://localhost:${PORT}`);
      console.log(` Health Check: http://localhost:${PORT}/health`);
      console.log(`=============================================`);
    });
  } catch (err) {
    console.error('Fatal failure starting TokoQuu server:', err);
    process.exit(1);
  }
}

bootstrap();
