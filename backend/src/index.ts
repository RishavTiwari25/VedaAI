import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { initializeSocket } from './socket/socketManager';
import assignmentRoutes from './routes/assignments';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/assignments', assignmentRoutes);

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Initialize Socket.io
initializeSocket(httpServer);

const PORT = parseInt(process.env.PORT || '5000', 10);

async function bootstrap() {
  // MongoDB — required
  await connectDatabase();

  // Redis — optional (graceful degradation)
  await connectRedis();

  httpServer.listen(PORT, () => {
    console.log(`🚀 VedaAI Server running on port ${PORT}`);
    console.log(`📡 WebSocket ready`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  });
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});
