import { Router } from 'express';
import {
  getPartners,
  invitePartner,
  acceptInvitation,
  revokePartner,
  getRules,
  setRule,
  deleteRule,
  evaluateRequirement,
  getPartnerInbox,
  recordPartnerDecision,
  getNotifications,
  markNotificationRead,
} from '../controllers/accountabilityController.js';
import { optionalAuthMiddleware, requireAuthMiddleware } from '../middleware/optionalAuthMiddleware.js';

const router = Router();

// Partner management
router.get('/partners', optionalAuthMiddleware, getPartners);
router.post('/partners/invite', requireAuthMiddleware, invitePartner);
router.post('/partners/:id/accept', optionalAuthMiddleware, acceptInvitation);
router.post('/partners/:id/revoke', requireAuthMiddleware, revokePartner);

// Commitment rules
router.get('/rules', optionalAuthMiddleware, getRules);
router.post('/rules', requireAuthMiddleware, setRule);
router.delete('/rules/:id', requireAuthMiddleware, deleteRule);
router.post('/rules/evaluate', optionalAuthMiddleware, evaluateRequirement);

// Partner Review Inbox (Strict server-side privacy boundary)
router.get('/partner/requests', optionalAuthMiddleware, getPartnerInbox);
router.post('/partner/requests/:id/decision', optionalAuthMiddleware, recordPartnerDecision);

// Partner Activity & Notifications feed
router.get('/notifications', optionalAuthMiddleware, getNotifications);
router.post('/notifications/:id/read', optionalAuthMiddleware, markNotificationRead);

export default router;
