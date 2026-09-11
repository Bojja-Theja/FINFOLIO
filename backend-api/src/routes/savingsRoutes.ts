import { Router } from 'express';
import {
  lock,
  unlock,
  getStatus,
  createPlan,
  getInsights,
  checkTransaction,
  processTransaction,
  triggerAutoSave
} from '../controllers/savingsController';
import { optionalAuthMiddleware, requireAuthMiddleware } from '../middleware/optionalAuthMiddleware';

const router = Router();

// Allow guests to view demo data; mutations still require auth
router.use(optionalAuthMiddleware);

// Savings management
router.get('/status', async (req, res) => {
  const userId = (req as any).userId;
  const isGuest = (req as any).isGuest;

  // Provide demo data for guests/unauthenticated so the UI renders without 401s
  if (!userId || isGuest) {
    return res.json({
      totalSaved: 125000,
      locked: 75000,
      available: 50000,
      monthlyAutoSave: 5200,
      disciplineScore: 78,
      plans: [
        {
          id: 1,
          name: 'Emergency Fund',
          target_amount: 150000,
          current_amount: 45000,
          monthly_contribution: 5000,
          lock_percentage: 80,
          target_date: '2025-12-31'
        },
        {
          id: 2,
          name: 'Vacation Fund',
          target_amount: 100000,
          current_amount: 25000,
          monthly_contribution: 3000,
          lock_percentage: 60,
          target_date: '2025-08-15'
        }
      ],
      isGuest: true,
      note: 'Demo savings data. Sign up to create and manage real plans.'
    });
  }

  return getStatus(req, res);
});

router.post('/lock', requireAuthMiddleware, lock);
router.post('/unlock/:planId', requireAuthMiddleware, unlock);

// Discipline protocol
router.post('/plan', requireAuthMiddleware, createPlan);
router.get('/insights', async (req, res) => {
  const userId = (req as any).userId;
  const isGuest = (req as any).isGuest;

  // Guest/demo insights so the page stays informative without login
  if (!userId || isGuest) {
    return res.json({
      insights: [
        'You saved 15% more this month compared to last month',
        'Entertainment spending is 30% below your limit',
        'Auto-save feature prevented ₹2,500 in impulse spending'
      ],
      recommendations: [
        'Consider increasing auto-save percentage to 30%',
        'Your discipline score improved by 5 points this month',
        'Next milestone: 6 months emergency fund in 45 days'
      ],
      achievements: [
        'Discipline Champion: 30 days of perfect savings',
        'Impulse Blocker: Prevented 15 unnecessary transactions'
      ],
      isGuest: true,
      note: 'Demo insights. Create an account to track your own savings discipline.'
    });
  }

  return getInsights(req, res);
});
router.post('/check-transaction', requireAuthMiddleware, checkTransaction);
router.post('/process-transaction', requireAuthMiddleware, processTransaction);
router.post('/auto-save', requireAuthMiddleware, triggerAutoSave);

export default router;