import { Router } from 'express';
import {
  listGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  contributeGoal,
  getFoundationSummary,
} from '../controllers/financialGoalController.js';
import { optionalAuthMiddleware, requireAuthMiddleware } from '../middleware/optionalAuthMiddleware.js';

const router = Router();

// Read operations: optional auth (allows demo mode for unauthenticated/guest users)
router.get('/', optionalAuthMiddleware, listGoals);
router.get('/summary', optionalAuthMiddleware, getFoundationSummary);
router.get('/:id', optionalAuthMiddleware, getGoal);

// Mutation operations: require authenticated session
router.post('/', requireAuthMiddleware, createGoal);
router.put('/:id', requireAuthMiddleware, updateGoal);
router.delete('/:id', requireAuthMiddleware, deleteGoal);
router.post('/:id/contribute', requireAuthMiddleware, contributeGoal);

export default router;
