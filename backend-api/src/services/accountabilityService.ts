import { DatabaseService } from './databaseService.js';
import {
  AccountabilityPartner,
  CommitmentLevel,
  CommitmentRule,
  WithdrawalRequest,
  WithdrawalStatus,
} from '../models/Accountability.js';
import { logger } from '../utils/logger.js';

export interface PartnerViewRequest {
  id: number;
  userId: number;
  amount: number;
  category: string;
  reason: string;
  status: WithdrawalStatus;
  estimatedDelayDays: number;
  runwayImpactMonths: number;
  isEmergency: boolean;
  isOverride: boolean;
  partnerNotes?: string | undefined;
  decisionDate?: Date | undefined;
  createdAt: Date;
}

export interface RuleEvaluationResult {
  requiresApproval: boolean;
  tier: 'essential' | 'important' | 'discretionary';
  rule: CommitmentRule | null;
  partnerId?: number | undefined;
  reason: string;
  maxInstantAmount: number;
}

const DEFAULT_ESSENTIAL_CATEGORIES = [
  'rent',
  'mortgage',
  'utilities',
  'groceries',
  'grocery',
  'health',
  'healthcare',
  'medical',
  'insurance',
  'bills',
  'essential',
];

const DEFAULT_IMPORTANT_CATEGORIES = [
  'transport',
  'transportation',
  'gas',
  'work',
  'education',
  'home maintenance',
  'maintenance',
  'repairs',
  'important',
];

export class AccountabilityService {
  /**
   * Invite an accountability partner
   */
  static async invitePartner(
    userId: number,
    name: string,
    email: string,
    relationship: string = 'mentor'
  ): Promise<AccountabilityPartner> {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedEmail || !trimmedName) {
      throw new Error('Partner name and valid email are required.');
    }

    // Check if partner already exists for this user
    const existingPartners = await DatabaseService.getAccountabilityPartners(userId);
    const alreadyInvited = existingPartners.find(
      p => p.email.toLowerCase() === trimmedEmail && p.status !== 'inactive'
    );

    if (alreadyInvited) {
      throw new Error(`An active or pending invitation for ${trimmedEmail} already exists.`);
    }

    const partner = await DatabaseService.createAccountabilityPartner({
      userId,
      name: trimmedName,
      email: trimmedEmail,
      relationship: relationship.trim() || 'mentor',
      status: 'pending',
    });

    logger.info(`User ${userId} invited accountability partner ${partner.id} (${trimmedEmail})`);

    // Audit log
    await DatabaseService.logAuditEvent({
      userId,
      action: 'partner_invited',
      resource: 'accountability_partners',
      status: 'success',
      details: {
        partnerId: partner.id,
        email: partner.email,
        relationship: partner.relationship,
      },
    });

    return partner;
  }

  /**
   * Accept partner invitation
   */
  static async acceptInvitation(partnerId: number, partnerEmail: string): Promise<AccountabilityPartner> {
    const partner = await DatabaseService.getAccountabilityPartnerById(partnerId);
    if (!partner) {
      throw new Error('Invitation not found.');
    }

    if (partner.email.toLowerCase() !== partnerEmail.trim().toLowerCase()) {
      throw new Error('Email address does not match this partner invitation.');
    }

    if (partner.status === 'active') {
      return partner;
    }

    const updated = await DatabaseService.updateAccountabilityPartnerStatus(partnerId, 'active');
    if (!updated) {
      throw new Error('Failed to accept partner invitation.');
    }

    logger.info(`Partner ${partnerId} (${partnerEmail}) accepted invitation for user ${partner.userId}`);

    await DatabaseService.logAuditEvent({
      userId: partner.userId,
      action: 'partner_accepted',
      resource: 'accountability_partners',
      status: 'success',
      details: {
        partnerId,
        partnerEmail: partner.email,
      },
    });

    return updated;
  }

  /**
   * Revoke partner relationship
   */
  static async revokePartner(userId: number, partnerId: number): Promise<boolean> {
    const partner = await DatabaseService.getAccountabilityPartnerById(partnerId);
    if (!partner || partner.userId !== userId) {
      throw new Error('Partner not found or not authorized to revoke.');
    }

    await DatabaseService.updateAccountabilityPartnerStatus(partnerId, 'inactive');

    // Unlink this partner from any commitment rules
    const rules = await DatabaseService.getCommitmentRules(userId);
    for (const rule of rules) {
      if (rule.partnerId === partnerId) {
        await DatabaseService.updateCommitmentRule(rule.id, userId, { partnerId: null });
      }
    }

    logger.info(`User ${userId} revoked accountability partner ${partnerId}`);

    await DatabaseService.logAuditEvent({
      userId,
      action: 'partner_revoked',
      resource: 'accountability_partners',
      status: 'success',
      details: { partnerId, partnerEmail: partner.email },
    });

    return true;
  }

  /**
   * Get all active & pending partners for user
   */
  static async getPartners(userId: number): Promise<AccountabilityPartner[]> {
    return DatabaseService.getAccountabilityPartners(userId);
  }

  /**
   * Get commitment rules for user with defaults if none set
   */
  static async getCommitmentRules(userId: number): Promise<CommitmentRule[]> {
    let rules = await DatabaseService.getCommitmentRules(userId);

    // If user has no rules yet, populate sensible 3-tier defaults
    if (rules.length === 0) {
      const defaultRules: Array<Omit<CommitmentRule, 'id' | 'createdAt' | 'updatedAt'>> = [
        {
          userId,
          category: 'Essential Expenses',
          level: 'low',
          requiresApproval: false,
          maxInstantAmount: 10000,
        },
        {
          userId,
          category: 'Important Expenses',
          level: 'medium',
          requiresApproval: true,
          maxInstantAmount: 100,
        },
        {
          userId,
          category: 'Discretionary Spending',
          level: 'high',
          requiresApproval: true,
          maxInstantAmount: 0,
        },
      ];

      for (const def of defaultRules) {
        await DatabaseService.createCommitmentRule(def);
      }

      rules = await DatabaseService.getCommitmentRules(userId);
    }

    return rules;
  }

  /**
   * Create or update a commitment rule
   */
  static async setCommitmentRule(
    userId: number,
    ruleData: {
      id?: number | undefined;
      category: string;
      level: CommitmentLevel;
      requiresApproval: boolean;
      maxInstantAmount: number;
      partnerId?: number | null | undefined;
    }
  ): Promise<CommitmentRule> {
    const category = ruleData.category.trim();
    if (!category) {
      throw new Error('Category name is required.');
    }

    if (ruleData.partnerId) {
      const partner = await DatabaseService.getAccountabilityPartnerById(ruleData.partnerId);
      if (!partner || partner.userId !== userId || partner.status !== 'active') {
        throw new Error('Selected accountability partner is not active or does not exist.');
      }
    }

    // Determine requiresApproval based on 3-tier rules
    let requiresApproval = ruleData.requiresApproval;
    if (ruleData.level === 'low') {
      requiresApproval = false;
    } else if (ruleData.level === 'high' || ruleData.level === 'strict') {
      requiresApproval = true;
    }

    if (ruleData.id) {
      const updated = await DatabaseService.updateCommitmentRule(ruleData.id, userId, {
        category,
        level: ruleData.level,
        requiresApproval,
        maxInstantAmount: Math.max(0, ruleData.maxInstantAmount),
        partnerId: ruleData.partnerId ?? null,
      });

      if (!updated) {
        throw new Error('Rule not found or unauthorized.');
      }

      await DatabaseService.logAuditEvent({
        userId,
        action: 'commitment_rule_updated',
        resource: 'commitment_rules',
        status: 'success',
        details: { ruleId: ruleData.id, category, level: ruleData.level },
      });

      return updated;
    }

    const created = await DatabaseService.createCommitmentRule({
      userId,
      category,
      level: ruleData.level,
      requiresApproval,
      maxInstantAmount: Math.max(0, ruleData.maxInstantAmount),
      ...(ruleData.partnerId !== undefined && { partnerId: ruleData.partnerId }),
    });

    await DatabaseService.logAuditEvent({
      userId,
      action: 'commitment_rule_created',
      resource: 'commitment_rules',
      status: 'success',
      details: { ruleId: created.id, category, level: created.level },
    });

    return created;
  }

  /**
   * Delete a commitment rule
   */
  static async deleteCommitmentRule(userId: number, ruleId: number): Promise<boolean> {
    const deleted = await DatabaseService.deleteCommitmentRule(ruleId, userId);
    if (deleted) {
      await DatabaseService.logAuditEvent({
        userId,
        action: 'commitment_rule_deleted',
        resource: 'commitment_rules',
        status: 'success',
        details: { ruleId },
      });
    }
    return deleted;
  }

  /**
   * Evaluate whether an expense requires partner approval based on 3-tier rules
   */
  static async evaluateRequirement(
    userId: number,
    amount: number,
    category: string
  ): Promise<RuleEvaluationResult> {
    const catLower = category.trim().toLowerCase();
    const rules = await this.getCommitmentRules(userId);

    // Look for exact category match
    const matchedRule = rules.find(r => r.category.toLowerCase() === catLower);

    if (matchedRule) {
      if (matchedRule.level === 'low') {
        return {
          requiresApproval: false,
          tier: 'essential',
          rule: matchedRule,
          reason: 'Essential category: instant execution allowed without approval.',
          maxInstantAmount: matchedRule.maxInstantAmount,
        };
      }

      if (matchedRule.level === 'medium') {
        const threshold = matchedRule.maxInstantAmount || 0;
        const requiresApproval = amount > threshold;
        return {
          requiresApproval,
          tier: 'important',
          rule: matchedRule,
          partnerId: matchedRule.partnerId || undefined,
          reason: requiresApproval
            ? `Amount ($${amount.toFixed(2)}) exceeds instant threshold ($${threshold.toFixed(2)}) for important category.`
            : `Amount ($${amount.toFixed(2)}) is within instant limit ($${threshold.toFixed(2)}).`,
          maxInstantAmount: threshold,
        };
      }

      // high or strict (Discretionary)
      return {
        requiresApproval: true,
        tier: 'discretionary',
        rule: matchedRule,
        partnerId: matchedRule.partnerId || undefined,
        reason: 'Discretionary category: requires accountability partner review before withdrawal.',
        maxInstantAmount: matchedRule.maxInstantAmount || 0,
      };
    }

    // Fallback based on category classification
    if (DEFAULT_ESSENTIAL_CATEGORIES.some(c => catLower.includes(c))) {
      return {
        requiresApproval: false,
        tier: 'essential',
        rule: null,
        reason: 'Essential need: no approval required.',
        maxInstantAmount: 10000,
      };
    }

    if (DEFAULT_IMPORTANT_CATEGORIES.some(c => catLower.includes(c))) {
      const threshold = 100;
      const requiresApproval = amount > threshold;
      return {
        requiresApproval,
        tier: 'important',
        rule: null,
        reason: requiresApproval
          ? `Important expense ($${amount.toFixed(2)}) exceeds instant threshold ($${threshold.toFixed(2)}).`
          : `Important expense within instant limit ($${threshold.toFixed(2)}).`,
        maxInstantAmount: threshold,
      };
    }

    // Default to Discretionary
    return {
      requiresApproval: true,
      tier: 'discretionary',
      rule: null,
      reason: 'Discretionary expense: partner review required to protect savings.',
      maxInstantAmount: 0,
    };
  }

  /**
   * Get partner inbox: STRICT SERVER-SIDE PRIVACY BOUNDARY
   * Only returns sanitized metrics required for the decision.
   * NEVER returns wallet balance, income, expenses, debts, or unrelated history.
   */
  static async getPartnerInbox(partnerEmail: string): Promise<PartnerViewRequest[]> {
    const rawRequests = await DatabaseService.getPendingRequestsForPartnerEmail(partnerEmail);

    // Enforce strict privacy boundary: map to sanitized view DTO
    return rawRequests.map(r => ({
      id: r.id,
      userId: r.userId,
      amount: r.amount,
      category: r.category,
      reason: r.reason,
      status: r.status,
      estimatedDelayDays: r.estimatedDelayDays,
      runwayImpactMonths: r.runwayImpactMonths,
      isEmergency: r.isEmergency,
      isOverride: r.isOverride,
      partnerNotes: r.partnerNotes ?? undefined,
      decisionDate: r.decisionDate ?? undefined,
      createdAt: r.createdAt,
    }));
  }

  /**
   * Record partner decision (Approve or Decline)
   */
  static async recordPartnerDecision(
    partnerEmail: string,
    requestId: number,
    decision: 'approved' | 'declined',
    notes?: string
  ): Promise<PartnerViewRequest> {
    const req = await DatabaseService.getWithdrawalRequestById(requestId);
    if (!req) {
      throw new Error('Withdrawal request not found.');
    }

    if (req.status !== 'pending') {
      throw new Error(`Cannot decide request in '${req.status}' state.`);
    }

    // Verify partner is authorized to decide this user's requests
    const authorizedPartners = await DatabaseService.getAccountabilityPartnersByEmail(partnerEmail);
    const isAuthorized = authorizedPartners.some(p => p.userId === req.userId && p.status === 'active');

    if (!isAuthorized) {
      throw new Error('You are not authorized as an active accountability partner for this request.');
    }

    const updated = await DatabaseService.updateWithdrawalRequestStatus(
      requestId,
      decision,
      notes?.trim() || undefined,
      new Date()
    );

    if (!updated) {
      throw new Error('Failed to record decision.');
    }

    logger.info(`Partner ${partnerEmail} marked request ${requestId} as ${decision}`);

    await DatabaseService.logAuditEvent({
      userId: req.userId,
      action: decision === 'approved' ? 'withdrawal_approved' : 'withdrawal_declined',
      resource: 'withdrawal_requests',
      status: 'success',
      details: {
        requestId,
        partnerEmail,
        decision,
        notes: notes?.trim() || null,
      },
    });

    return {
      id: updated.id,
      userId: updated.userId,
      amount: updated.amount,
      category: updated.category,
      reason: updated.reason,
      status: updated.status,
      estimatedDelayDays: updated.estimatedDelayDays,
      runwayImpactMonths: updated.runwayImpactMonths,
      isEmergency: updated.isEmergency,
      isOverride: updated.isOverride,
      partnerNotes: updated.partnerNotes ?? undefined,
      decisionDate: updated.decisionDate ?? undefined,
      createdAt: updated.createdAt,
    };
  }
}
