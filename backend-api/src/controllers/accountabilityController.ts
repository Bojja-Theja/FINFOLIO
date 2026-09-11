import { Request, Response } from 'express';
import { AccountabilityService } from '../services/accountabilityService';
import { EmergencyService } from '../services/emergencyService';
import { logger } from '../utils/logger';

export const getPartners = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const partners = await AccountabilityService.getPartners(userId);
    return res.json({ success: true, partners });
  } catch (error: any) {
    logger.error(`Error retrieving partners: ${error.message}`);
    return res.status(500).json({ error: error.message || 'Failed to retrieve partners' });
  }
};

export const invitePartner = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const { name, email, relationship } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required to invite a partner.' });
    }

    const partner = await AccountabilityService.invitePartner(userId, name, email, relationship);
    return res.status(201).json({
      success: true,
      message: `Invitation sent to ${email}`,
      partner,
    });
  } catch (error: any) {
    logger.error(`Error inviting partner: ${error.message}`);
    return res.status(400).json({ error: error.message || 'Failed to invite partner' });
  }
};

export const acceptInvitation = async (req: Request, res: Response) => {
  try {
    const partnerId = parseInt(req.params.id as string, 10);
    if (isNaN(partnerId)) {
      return res.status(400).json({ error: 'Invalid partner ID' });
    }

    const partnerEmail = req.body.email || (req as any).user?.email;
    if (!partnerEmail) {
      return res.status(400).json({ error: 'Email address is required to verify acceptance.' });
    }

    const partner = await AccountabilityService.acceptInvitation(partnerId, partnerEmail);
    return res.json({
      success: true,
      message: 'Invitation accepted successfully.',
      partner,
    });
  } catch (error: any) {
    logger.error(`Error accepting invitation: ${error.message}`);
    return res.status(400).json({ error: error.message || 'Failed to accept invitation' });
  }
};

export const revokePartner = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const partnerId = parseInt(req.params.id as string, 10);

    if (isNaN(partnerId)) {
      return res.status(400).json({ error: 'Invalid partner ID' });
    }

    await AccountabilityService.revokePartner(userId, partnerId);
    return res.json({
      success: true,
      message: 'Accountability partner revoked successfully.',
    });
  } catch (error: any) {
    logger.error(`Error revoking partner: ${error.message}`);
    return res.status(400).json({ error: error.message || 'Failed to revoke partner' });
  }
};

export const getRules = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const rules = await AccountabilityService.getCommitmentRules(userId);
    return res.json({ success: true, rules });
  } catch (error: any) {
    logger.error(`Error retrieving rules: ${error.message}`);
    return res.status(500).json({ error: error.message || 'Failed to retrieve rules' });
  }
};

export const setRule = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const { id, category, level, requiresApproval, maxInstantAmount, partnerId } = req.body;

    if (!category || !level) {
      return res.status(400).json({ error: 'Category and commitment level are required.' });
    }

    const rule = await AccountabilityService.setCommitmentRule(userId, {
      id: id ? parseInt(id, 10) : undefined,
      category,
      level,
      requiresApproval: Boolean(requiresApproval),
      maxInstantAmount: parseFloat(maxInstantAmount) || 0,
      partnerId: partnerId ? parseInt(partnerId, 10) : null,
    });

    return res.status(200).json({
      success: true,
      message: 'Commitment rule saved successfully.',
      rule,
    });
  } catch (error: any) {
    logger.error(`Error saving rule: ${error.message}`);
    return res.status(400).json({ error: error.message || 'Failed to save commitment rule' });
  }
};

export const deleteRule = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const ruleId = parseInt(req.params.id as string, 10);

    if (isNaN(ruleId)) {
      return res.status(400).json({ error: 'Invalid rule ID' });
    }

    const success = await AccountabilityService.deleteCommitmentRule(userId, ruleId);
    if (!success) {
      return res.status(404).json({ error: 'Rule not found or unauthorized' });
    }

    return res.json({ success: true, message: 'Commitment rule deleted.' });
  } catch (error: any) {
    logger.error(`Error deleting rule: ${error.message}`);
    return res.status(400).json({ error: error.message || 'Failed to delete rule' });
  }
};

export const evaluateRequirement = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const { amount, category } = req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({ error: 'Amount must be a non-negative number.' });
    }

    if (!category) {
      return res.status(400).json({ error: 'Category is required for rule evaluation.' });
    }

    const evaluation = await AccountabilityService.evaluateRequirement(userId, parsedAmount, category);
    return res.json({ success: true, evaluation });
  } catch (error: any) {
    logger.error(`Error evaluating rule requirement: ${error.message}`);
    return res.status(500).json({ error: error.message || 'Failed to evaluate requirement' });
  }
};

/**
 * Partner Inbox: Server-side privacy bounded endpoint.
 * Returns only request amount, category, reason, delay, and runway impact.
 * NEVER returns user wallet balances, income, expenses, or debt records.
 */
export const getPartnerInbox = async (req: Request, res: Response) => {
  try {
    const partnerEmail = (req.query.email as string) || (req as any).user?.email;
    if (!partnerEmail) {
      return res.status(400).json({ error: 'Partner email is required to view partner inbox.' });
    }

    const requests = await AccountabilityService.getPartnerInbox(partnerEmail);
    return res.json({
      success: true,
      partnerEmail,
      privacyMode: 'strict_boundary_enforced',
      description: 'Partner view scrubbed of user wallet balances, salary, and private history.',
      requests,
    });
  } catch (error: any) {
    logger.error(`Error retrieving partner inbox: ${error.message}`);
    return res.status(500).json({ error: error.message || 'Failed to retrieve partner requests' });
  }
};

/**
 * Partner Decision: Approve or Decline request
 */
export const recordPartnerDecision = async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id as string, 10);
    if (isNaN(requestId)) {
      return res.status(400).json({ error: 'Invalid request ID' });
    }

    const { decision, notes, partnerEmail: bodyEmail } = req.body;
    const partnerEmail = bodyEmail || (req as any).user?.email;

    if (!partnerEmail) {
      return res.status(400).json({ error: 'Partner email is required to submit decision.' });
    }

    if (decision !== 'approved' && decision !== 'declined') {
      return res.status(400).json({ error: "Decision must be either 'approved' or 'declined'." });
    }

    const updated = await AccountabilityService.recordPartnerDecision(
      partnerEmail,
      requestId,
      decision,
      notes
    );

    return res.json({
      success: true,
      message: `Request successfully marked as ${decision}.`,
      request: updated,
    });
  } catch (error: any) {
    logger.error(`Error recording partner decision: ${error.message}`);
    return res.status(400).json({ error: error.message || 'Failed to record decision' });
  }
};

/**
 * Get notification feed for user or partner
 */
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const partnerEmail = (req.query.partnerEmail as string) || (req as any).user?.email;

    const notifications = await EmergencyService.getNotifications(userId, partnerEmail);
    return res.json({ success: true, notifications });
  } catch (error: any) {
    logger.error(`Error retrieving notifications: ${error.message}`);
    return res.status(500).json({ error: error.message || 'Failed to retrieve notifications' });
  }
};

/**
 * Mark notification as read
 */
export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const notificationId = parseInt(req.params.id as string, 10);
    if (isNaN(notificationId)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }

    const success = await EmergencyService.markNotificationRead(notificationId);
    return res.json({ success });
  } catch (error: any) {
    logger.error(`Error marking notification read: ${error.message}`);
    return res.status(400).json({ error: error.message || 'Failed to update notification' });
  }
};

