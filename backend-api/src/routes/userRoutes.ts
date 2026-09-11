import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController';
import { requireAuthMiddleware } from '../middleware/optionalAuthMiddleware';

const router = Router();

router.use(requireAuthMiddleware);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;