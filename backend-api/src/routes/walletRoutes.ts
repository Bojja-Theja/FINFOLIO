import { Router } from 'express';
import {
  getWallet,
  deposit,
  withdraw,
  getTransactions,
} from '../controllers/walletController.js';
import { optionalAuthMiddleware, requireAuthMiddleware } from '../middleware/optionalAuthMiddleware.js';

const router = Router();

// Read operations: optional auth to allow guest/demo viewing
router.get('/', optionalAuthMiddleware, getWallet);
router.get('/transactions', optionalAuthMiddleware, getTransactions);

// Financial operations: require authenticated session
router.post('/deposit', requireAuthMiddleware, deposit);
router.post('/withdraw', requireAuthMiddleware, withdraw);

export default router;
