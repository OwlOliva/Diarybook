import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadBookCover } from '../middleware/upload';
import {
  getBooks,
  getBook,
  createBookController,
  updateBookController,
  deleteBookController,
  getStatistics,
  updateReadPagesController
} from '../controllers/bookController';

const router = Router();

router.use(authenticate);

router.get('/', getBooks);
router.get('/statistics', getStatistics);
router.get('/:id', getBook);
router.post('/', uploadBookCover, createBookController);
router.put('/:id', uploadBookCover, updateBookController);
router.patch('/:id/read-pages', updateReadPagesController); // Маршрут для трекера
router.delete('/:id', deleteBookController);

export default router;