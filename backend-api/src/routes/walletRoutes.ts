import { Router } from 'express';
import {
  getWallet,
  deposit,
  withdraw,
  getTransactions,
} from '../controllers/walletController';
import { optionalAuthMiddleware, requireAuthMiddleware } from '../middleware/optionalAuthMiddleware';

const router = Router();

// Read operations: optional auth to allow guest/demo viewing
router.get('/', optionalAuthMiddleware, getWallet);
router.get('/transactions', optionalAuthMiddleware, getTransactions);

// Financial operations: require authenticated session
router.post('/deposit', requireAuthMiddleware, deposit);
router.post('/withdraw', requireAuthMiddleware, withdraw);

export default router;
