import app from './app';
import dotenv from 'dotenv';
import { query } from './config/database';

dotenv.config();

const PORT = process.env.PORT || 80;

const startServer = async () => {
  try {
    // Проверка подключения к БД (опционально)
    await query('SELECT NOW()');
    console.log('✅ Database connection established');
    
    // ВАЖНО: слушаем 0.0.0.0
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();