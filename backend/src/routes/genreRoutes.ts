import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getGenres, getPopularGenresList, getGenre, createNewGenre } from '../controllers/genreController';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

router.get('/', getGenres);
router.get('/popular', getPopularGenresList);
router.get('/:id', getGenre);
router.post('/', createNewGenre); // Опционально, для добавления новых жанров

export default router;