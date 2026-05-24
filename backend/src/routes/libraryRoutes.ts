import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getAllBooks,
  getBookDetails,
  addCommentToBook,
  getBookComments,
  addBookToMyLibrary
} from '../controllers/libraryController';

const router = Router();


router.get('/books', getAllBooks);
router.get('/books/:id', getBookDetails);
router.get('/books/:id/comments', getBookComments);

router.post('/books/:id/comments', authenticate, addCommentToBook);
router.post('/books/:id/add-to-my-library', authenticate, addBookToMyLibrary);

export default router;