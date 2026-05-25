import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/authRoutes';
import bookRoutes from './routes/bookRoutes';
import profileRoutes from './routes/profileRoutes';
import libraryRoutes from './routes/libraryRoutes';
import genreRoutes from './routes/genreRoutes';
import artRoutes from './routes/artRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// CORS настройки
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Логирование
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Статические файлы (загруженные изображения)
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use(`/${uploadDir}`, express.static(path.join(process.cwd(), uploadDir)));

// ============= API Routes =============
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/arts', artRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============= Раздача Frontend =============
// Путь к собранному фронтенду (в режиме production)
// Пути ищутся в порядке приоритета
const possiblePaths = [
  path.join(process.cwd(), '../frontend/dist'),  // стандартный путь
  path.join(process.cwd(), '../../frontend/dist'), // альтернативный путь
  path.join(process.cwd(), 'frontend/dist'),      // если фронтенд внутри backend
  path.join(__dirname, '../../frontend/dist'),    // от корня проекта
];

let clientPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    clientPath = p;
    console.log(`✅ Frontend found at: ${clientPath}`);
    break;
  }
}

if (clientPath && fs.existsSync(path.join(clientPath, 'index.html'))) {
  // Раздаём статические файлы (CSS, JS, изображения)
  app.use(express.static(clientPath));
  
  // Все остальные GET-запросы (не API) отдаём index.html
app.use((_req, res) => {
  // Отдаем index.html для всех запросов, не обработанных выше
  res.sendFile(path.join(clientPath, 'index.html'));
});
  console.log(`📱 Frontend will be served from: ${clientPath}`);
} else {
  console.log('⚠️ Frontend not found. Only API will work.');
  console.log('   Make sure to run: cd frontend && npm run build');
}

// ============= 404 Handler (только для API) =============
app.use('/api/', (_req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// ============= Error Handler =============
app.use(errorHandler);

export default app;