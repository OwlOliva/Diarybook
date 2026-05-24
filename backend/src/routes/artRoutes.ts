import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadArtImage } from '../middleware/artUpload';
import { getBookArts, addBookArt, deleteBookArt } from '../controllers/artController';

const router = Router();

router.use(authenticate);

router.get('/books/:bookId/arts', getBookArts);
router.post('/books/:bookId/arts', uploadArtImage, addBookArt);
router.delete('/arts/:artId', deleteBookArt);

export default router;