import { Router } from 'express';
import {
  analyzeImpact,
  requestWithdrawal,
  getWithdrawals,
  getWithdrawalById,
  executeApprovedWithdrawal,
  cancelWithdrawalRequest,
  executeEmergency,
  getEmergencyPatterns,
  executeOverride,
} from '../controllers/withdrawalController.js';
import { optionalAuthMiddleware, requireAuthMiddleware } from '../middleware/optionalAuthMiddleware.js';

const router = Router();

// Read operations: optional auth to allow guest/demo viewing
router.post('/analyze', optionalAuthMiddleware, analyzeImpact);
router.get('/', optionalAuthMiddleware, getWithdrawals);
router.get('/patterns', optionalAuthMiddleware, getEmergencyPatterns);
router.get('/:id', optionalAuthMiddleware, getWithdrawalById);

// Financial operations: require authenticated session
router.post('/request', requireAuthMiddleware, requestWithdrawal);
router.post('/emergency', requireAuthMiddleware, executeEmergency);
router.post('/override', requireAuthMiddleware, executeOverride);
router.post('/:id/execute', requireAuthMiddleware, executeApprovedWithdrawal);
router.post('/:id/cancel', requireAuthMiddleware, cancelWithdrawalRequest);

export default router;
