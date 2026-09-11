import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { requireAuthMiddleware } from '../middleware/optionalAuthMiddleware.js';

const router = Router();

router.use(requireAuthMiddleware);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;