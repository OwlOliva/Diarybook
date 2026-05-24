import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';
import {
  getSystemStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUser,
  deleteUser,
  getAllBooksAdmin,
  getBookByIdAdmin,
  updateBookAdmin,
  deleteBookAdmin,
  getAllComments,
  updateComment,
  deleteComment,
  getAllGenresAdmin,
  getGenreById,
  addGenre,
  updateGenre,
  deleteGenre,
  getAllArts,
  deleteArt
} from '../controllers/adminController';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

// Статистика
router.get('/stats', getSystemStats);

// Пользователи
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Книги
router.get('/books', getAllBooksAdmin);
router.get('/books/:id', getBookByIdAdmin);
router.put('/books/:id', updateBookAdmin);
router.delete('/books/:id', deleteBookAdmin);

// Комментарии
router.get('/comments', getAllComments);
router.put('/comments/:id', updateComment);
router.delete('/comments/:id', deleteComment);

// Жанры
router.get('/genres', getAllGenresAdmin);
router.get('/genres/:id', getGenreById);
router.post('/genres', addGenre);
router.put('/genres/:id', updateGenre);
router.delete('/genres/:id', deleteGenre);

// Арты
router.get('/arts', getAllArts);
router.delete('/arts/:id', deleteArt);

export default router;