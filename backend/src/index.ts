// import app from './app';
// import dotenv from 'dotenv';
// import { query } from './config/database';

// dotenv.config();

// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   try {
//     await query('SELECT NOW()');
//     console.log('✅ Database connection established');
    
//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//       console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
//     });
//   } catch (error) {
//     console.error('❌ Failed to connect to database:', error);
//     process.exit(1);
//   }
// };

// startServer();
import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend available at http://localhost:${PORT}`);
});