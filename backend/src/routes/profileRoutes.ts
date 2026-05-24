import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getProfile, updateProfile, changePassword, deleteAccount } from '../controllers/profileController';

const router = Router();

router.use(authenticate);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/change-password', changePassword);
router.delete('/', deleteAccount);

export default router;