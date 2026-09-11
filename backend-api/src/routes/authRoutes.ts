import { Router } from 'express';
import { login, register, guestLogin } from '../controllers/authController.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/guest', guestLogin);

export default router;