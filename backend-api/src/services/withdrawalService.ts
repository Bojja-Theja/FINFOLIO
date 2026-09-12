import { DatabaseService } from './databaseService.js';
import { WalletService } from './walletService.js';
import { FinancialGoalService } from './financialGoalService.js';
import { ImpactAnalysisService, PreTransactionImpact } from './impactAnalysisService.js';
import { EmergencyAnomalyResult, WithdrawalRequest, WithdrawalStatus } from '../models/Accountability.js';
import { WalletTransaction } from '../models/Wallet.js';
import { EmergencyService } from './emergencyService.js';
import { logger } from '../utils/logger.js';

export interface WithdrawalExecutionResult {
  request: WithdrawalRequest;
  impact: PreTransactionImpact;
  executed: boolean;
  transaction?: WalletTransaction | undefined;
  anomaly?: EmergencyAnomalyResult | undefined;
  message: string;
}

export class WithdrawalService {
  /**
   * Request or instantly execute a withdrawal based on commitment rules and pre-transaction impact
   */
  static async createWithdrawalRequest(
    userId: number,
    amount: number,
    category: string,
    reason: string,
    goalId?: number | undefined,
    isEmergency: boolean = false,
    isOverride: boolean = false
  ): Promise<WithdrawalExecutionResult> {
    const parsedAmount = Math.max(0, Math.round(amount * 100) / 100);
    if (parsedAmount <= 0) {
      throw new Error('Withdrawal amount must be greater than zero.');
    }

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      throw new Error('A reason is required for withdrawal requests.');
    }

    // If emergency, route to dedicated EmergencyService for post-execution partner notification and anomaly detection
    if (isEmergency) {
      const emergencyRes = await EmergencyService.executeEmergencyWithdrawal(
        userId,
        parsedAmount,
        trimmedReason,
        category,
        goalId
      );
      return {
        request: emergencyRes.request,
        impact: emergencyRes.impact,
        executed: true,
        transaction: emergencyRes.transaction,
        anomaly: emergencyRes.anomaly,
        message: emergencyRes.message,
      };
    }

    // If conscious override, route to dedicated executeConsciousOverride
    if (isOverride) {
      return this.executeConsciousOverride(
        userId,
        parsedAmount,
        category,
        trimmedReason,
        'I understand this may delay my goal and reduce my financial runway.',
        goalId
      );
    }

    const wallet = await WalletService.getWallet(userId);
    if (wallet.balance < parsedAmount) {
      throw new Error(
        `Insufficient wallet balance ($${wallet.balance.toFixed(2)}) for requested withdrawal ($${parsedAmount.toFixed(2)}).`
      );
    }

    // Deterministic pre-transaction consequence analysis
    const impact = await ImpactAnalysisService.analyzePreTransactionImpact(
      userId,
      parsedAmount,
      category,
      goalId
    );

    // Check if immediate execution is allowed (Essential tier or Important within threshold)
    const canExecuteImmediately = !impact.requiresApproval;

    if (canExecuteImmediately) {
      // Execute atomically
      const { transaction } = await WalletService.withdraw(
        userId,
        parsedAmount,
        category,
        trimmedReason
      );

      // Record in withdrawal_requests as executed
      const request = await DatabaseService.createWithdrawalRequest({
        userId,
        walletId: wallet.id,
        goalId: goalId || undefined,
        amount: parsedAmount,
        category,
        reason: trimmedReason,
        status: 'executed',
        estimatedDelayDays: impact.estimatedDelayDays,
        runwayImpactMonths: impact.runwayImpactMonths,
        isEmergency,
        isOverride,
        decisionDate: new Date(),
      });

      // If tied to a goal, record contribution decrement in goal
      if (goalId) {
        try {
          const goal = await FinancialGoalService.getGoalById(userId, goalId);
          if (goal) {
            const newCurrent = Math.max(0, goal.currentAmount - parsedAmount);
            await FinancialGoalService.updateGoal(userId, goalId, { currentAmount: newCurrent });
          }
        } catch (e) {
          logger.warn(`Could not update linked goal ${goalId}: ${e}`);
        }
      }

      await DatabaseService.logAuditEvent({
        userId,
        action: isEmergency ? 'emergency_withdrawal_executed' : 'instant_withdrawal_executed',
        resource: 'withdrawal_requests',
        status: 'success',
        details: {
          requestId: request.id,
          amount: parsedAmount,
          category,
          tier: impact.tier,
          transactionId: transaction.id,
        },
      });

      logger.info(
        `Withdrawal request #${request.id} executed instantly for user ${userId}: $${parsedAmount}`
      );

      return {
        request,
        impact,
        executed: true,
        transaction,
        message: `Withdrawal of $${parsedAmount.toFixed(2)} executed successfully.`,
      };
    }

    // Requires partner approval -> Create in pending status without deducting funds
    const request = await DatabaseService.createWithdrawalRequest({
      userId,
      walletId: wallet.id,
      goalId: goalId || undefined,
      amount: parsedAmount,
      category,
      reason: trimmedReason,
      status: 'pending',
      estimatedDelayDays: impact.estimatedDelayDays,
      runwayImpactMonths: impact.runwayImpactMonths,
      isEmergency: false,
      isOverride: false,
    });

    await DatabaseService.logAuditEvent({
      userId,
      action: 'withdrawal_request_created',
      resource: 'withdrawal_requests',
      status: 'success',
      details: {
        requestId: request.id,
        amount: parsedAmount,
        category,
        assignedPartnerId: impact.assignedPartnerId,
        tier: impact.tier,
      },
    });

    // Notify assigned partner or active accountability partners about pending review
    try {
      let partnerToNotify: { id?: number; email: string } | null = null;
      if (impact.assignedPartnerId) {
        const p = await DatabaseService.getAccountabilityPartnerById(impact.assignedPartnerId);
        if (p && p.status === 'active') {
          partnerToNotify = p;
        }
      }
      if (!partnerToNotify) {
        const partners = await DatabaseService.getAccountabilityPartners(userId);
        const activePartner = partners.find(p => p.status === 'active');
        if (activePartner) {
          partnerToNotify = activePartner;
        }
      }

      if (partnerToNotify) {
        await DatabaseService.createPartnerNotification({
          userId,
          partnerId: partnerToNotify.id,
          partnerEmail: partnerToNotify.email,
          type: 'withdrawal_review_required',
          title: '⚠️ Discretionary Withdrawal Review Required',
          message: `User #${userId} requested a withdrawal of ₹${parsedAmount.toFixed(2)} (${category}). Reason: "${trimmedReason}". Requires your review.`,
          details: {
            requestId: request.id,
            amount: parsedAmount,
            category,
            reason: trimmedReason,
            delayDays: impact.estimatedDelayDays,
            runwayImpactMonths: impact.runwayImpactMonths,
            createdAt: new Date(),
          },
        });
      }
    } catch (notifyErr) {
      logger.warn(`Failed to dispatch partner review notification: ${notifyErr}`);
    }

    logger.info(
      `Discretionary withdrawal request #${request.id} created in 'pending' status for user ${userId}: $${parsedAmount}`
    );

    return {
      request,
      impact,
      executed: false,
      message: `Withdrawal request submitted for partner review (+${impact.estimatedDelayDays} days estimated goal delay).`,
    };
  }

  /**
   * Execute a conscious user override on commitment rules
   * Requires an explicit consequence acknowledgement
   */
  static async executeConsciousOverride(
    userId: number,
    amount: number,
    category: string,
    reason: string,
    acknowledgement: string,
    goalId?: number | undefined
  ): Promise<WithdrawalExecutionResult> {
    const parsedAmount = Math.max(0, Math.round(amount * 100) / 100);
    if (parsedAmount <= 0) {
      throw new Error('Withdrawal amount must be greater than zero.');
    }

    const trimmedReason = reason ? reason.trim() : '';
    if (!trimmedReason) {
      throw new Error('A reason is required for withdrawal requests.');
    }

    const trimmedAck = acknowledgement ? acknowledgement.trim() : '';
    if (!trimmedAck) {
      throw new Error(
        "Explicit consequence acknowledgement is required to override commitment rules: 'I understand this may delay my goal and reduce my financial runway.'"
      );
    }

    const wallet = await WalletService.getWallet(userId);
    if (wallet.balance < parsedAmount) {
      throw new Error(
        `Insufficient wallet balance ($${wallet.balance.toFixed(2)}) for requested withdrawal ($${parsedAmount.toFixed(2)}).`
      );
    }

    // Pre-transaction consequence analysis
    const impact = await ImpactAnalysisService.analyzePreTransactionImpact(
      userId,
      parsedAmount,
      category,
      goalId
    );

    // Atomically withdraw
    const { transaction } = await WalletService.withdraw(
      userId,
      parsedAmount,
      category,
      `OVERRIDE: ${trimmedReason}`,
      `override-${Date.now()}`
    );

    // Record request with isOverride = true
    const request = await DatabaseService.createWithdrawalRequest({
      userId,
      walletId: wallet.id,
      goalId: goalId || undefined,
      amount: parsedAmount,
      category,
      reason: trimmedReason,
      status: 'executed',
      estimatedDelayDays: impact.estimatedDelayDays,
      runwayImpactMonths: impact.runwayImpactMonths,
      isEmergency: false,
      isOverride: true,
      partnerNotes: `Conscious override acknowledged: "${trimmedAck}"`,
      decisionDate: new Date(),
    });

    // Linked goal adjustment
    if (goalId) {
      try {
        const goal = await FinancialGoalService.getGoalById(userId, goalId);
        if (goal) {
          const newCurrent = Math.max(0, goal.currentAmount - parsedAmount);
          await FinancialGoalService.updateGoal(userId, goalId, { currentAmount: newCurrent });
        }
      } catch (e) {
        logger.warn(`Could not update goal #${goalId} during override: ${e}`);
      }
    }

    // Audit log
    await DatabaseService.logAuditEvent({
      userId,
      action: 'conscious_override_executed',
      resource: 'withdrawal_requests',
      status: 'success',
      details: {
        requestId: request.id,
        amount: parsedAmount,
        category,
        delayDays: impact.estimatedDelayDays,
        runwayImpactMonths: impact.runwayImpactMonths,
        acknowledgement: trimmedAck,
        transactionId: transaction.id,
      },
    });

    // Notify active accountability partners
    try {
      const partners = await DatabaseService.getAccountabilityPartners(userId);
      const activePartners = partners.filter(p => p.status === 'active');
      for (const partner of activePartners) {
        await DatabaseService.createPartnerNotification({
          userId,
          partnerId: partner.id,
          partnerEmail: partner.email,
          type: 'withdrawal_decision',
          title: '⚡ Conscious Override Notice',
          message: `User #${userId} exercised a conscious override for $${parsedAmount.toFixed(2)} (${category}). Consequence acknowledged: "${trimmedAck}"`,
          details: {
            requestId: request.id,
            amount: parsedAmount,
            category,
            acknowledgement: trimmedAck,
            delayDays: impact.estimatedDelayDays,
            timestamp: new Date(),
          },
        });
      }
    } catch (e) {
      logger.warn(`Failed to notify partners of conscious override: ${e}`);
    }

    logger.info(
      `Conscious override executed for user ${userId}: $${parsedAmount} (Request #${request.id})`
    );

    return {
      request,
      impact,
      executed: true,
      transaction,
      message: `Withdrawal of $${parsedAmount.toFixed(2)} executed via conscious override. Consequence acknowledged (+${impact.estimatedDelayDays}d delay).`,
    };
  }

  /**
   * Execute an approved withdrawal atomically
   */
  static async executeApprovedWithdrawal(
    userId: number,
    requestId: number
  ): Promise<{ request: WithdrawalRequest; transaction: WalletTransaction }> {
    // 1. Atomically transition from 'approved' to 'executed' to eliminate race conditions
    const executedRequest = await DatabaseService.atomicTransitionApprovedToExecuted(
      requestId,
      userId
    );

    if (!executedRequest) {
      const existing = await DatabaseService.getWithdrawalRequestById(requestId);
      if (!existing || existing.userId !== userId) {
        throw new Error('Withdrawal request not found.');
      }
      if (existing.status === 'executed') {
        throw new Error('This withdrawal request has already been executed.');
      }
      if (existing.status === 'declined') {
        throw new Error('Cannot execute a declined withdrawal request.');
      }
      if (existing.status === 'cancelled') {
        throw new Error('Cannot execute a cancelled withdrawal request.');
      }
      throw new Error(
        `Withdrawal request is currently '${existing.status}' and requires partner approval before execution.`
      );
    }

    // 2. Perform atomic balance deduction
    let transaction: WalletTransaction;
    try {
      const result = await WalletService.withdraw(
        userId,
        executedRequest.amount,
        executedRequest.category,
        executedRequest.reason,
        `req-${executedRequest.id}`
      );
      transaction = result.transaction;
    } catch (deductErr) {
      // Revert request status back to 'approved' if balance deduction failed
      await DatabaseService.updateWithdrawalRequestStatus(requestId, 'approved');
      throw deductErr;
    }

    // 3. Update linked goal if present
    if (executedRequest.goalId) {
      try {
        const goal = await FinancialGoalService.getGoalById(userId, executedRequest.goalId);
        if (goal) {
          const newCurrent = Math.max(0, goal.currentAmount - executedRequest.amount);
          await FinancialGoalService.updateGoal(userId, executedRequest.goalId, {
            currentAmount: newCurrent,
          });
        }
      } catch (e) {
        logger.warn(`Could not update linked goal ${executedRequest.goalId}: ${e}`);
      }
    }

    await DatabaseService.logAuditEvent({
      userId,
      action: 'approved_withdrawal_executed',
      resource: 'withdrawal_requests',
      status: 'success',
      details: {
        requestId,
        amount: executedRequest.amount,
        transactionId: transaction.id,
      },
    });

    logger.info(
      `Approved withdrawal request #${requestId} executed for user ${userId}: $${executedRequest.amount}`
    );

    return { request: executedRequest, transaction };
  }

  /**
   * Cancel a pending withdrawal request
   */
  static async cancelWithdrawalRequest(
    userId: number,
    requestId: number
  ): Promise<WithdrawalRequest> {
    const request = await DatabaseService.getWithdrawalRequestById(requestId);
    if (!request || request.userId !== userId) {
      throw new Error('Withdrawal request not found.');
    }

    if (request.status !== 'pending') {
      throw new Error(`Cannot cancel request in '${request.status}' state.`);
    }

    const updated = await DatabaseService.updateWithdrawalRequestStatus(requestId, 'cancelled');
    if (!updated) {
      throw new Error('Failed to cancel request.');
    }

    await DatabaseService.logAuditEvent({
      userId,
      action: 'withdrawal_request_cancelled',
      resource: 'withdrawal_requests',
      status: 'success',
      details: { requestId },
    });

    return updated;
  }

  /**
   * Get all withdrawal requests for user
   */
  static async getUserWithdrawals(userId: number): Promise<WithdrawalRequest[]> {
    return DatabaseService.getWithdrawalRequests(userId);
  }

  /**
   * Get specific withdrawal request details
   */
  static async getWithdrawalById(
    userId: number,
    requestId: number
  ): Promise<WithdrawalRequest | null> {
    const request = await DatabaseService.getWithdrawalRequestById(requestId);
    if (!request || request.userId !== userId) {
      return null;
    }
    return request;
  }
}
