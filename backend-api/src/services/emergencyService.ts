import { DatabaseService } from './databaseService.js';
import { WalletService } from './walletService.js';
import { FinancialGoalService } from './financialGoalService.js';
import { ImpactAnalysisService, PreTransactionImpact } from './impactAnalysisService.js';
import {
  EmergencyAnomalyResult,
  PartnerNotification,
  WithdrawalRequest,
} from '../models/Accountability.js';
import { WalletTransaction } from '../models/Wallet.js';
import { logger } from '../utils/logger.js';

export interface EmergencyWithdrawalResult {
  request: WithdrawalRequest;
  transaction: WalletTransaction;
  impact: PreTransactionImpact;
  anomaly: EmergencyAnomalyResult;
  partnersNotified: number;
  message: string;
}

export class EmergencyService {
  /**
   * Execute an emergency withdrawal immediately
   * Enforces security, ownership, and non-negative wallet balance.
   * Immediately unblocks funds, logs immutable audit trail, notifies partner post-execution,
   * and evaluates anomaly patterns non-judgmentally.
   */
  static async executeEmergencyWithdrawal(
    userId: number,
    amount: number,
    reason: string,
    category: string = 'emergency',
    goalId?: number | undefined
  ): Promise<EmergencyWithdrawalResult> {
    const parsedAmount = Math.max(0, Math.round(amount * 100) / 100);
    if (parsedAmount <= 0) {
      throw new Error('Emergency withdrawal amount must be greater than zero.');
    }

    const trimmedReason = reason ? reason.trim() : '';
    if (!trimmedReason) {
      throw new Error('A specific reason is required for emergency withdrawals.');
    }

    // Balance check - non-negative invariant strictly preserved
    const wallet = await WalletService.getWallet(userId);
    if (wallet.balance < parsedAmount) {
      throw new Error(
        `Insufficient wallet balance ($${wallet.balance.toFixed(2)}) for requested emergency withdrawal ($${parsedAmount.toFixed(2)}).`
      );
    }

    // Deterministic consequence analysis
    const impact = await ImpactAnalysisService.analyzePreTransactionImpact(
      userId,
      parsedAmount,
      category,
      goalId
    );

    // Atomic withdrawal from wallet
    const { transaction } = await WalletService.withdraw(
      userId,
      parsedAmount,
      category,
      `EMERGENCY: ${trimmedReason}`,
      `emergency-${Date.now()}`
    );

    // Record executed withdrawal request with isEmergency = true
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
      isEmergency: true,
      isOverride: false,
      decisionDate: new Date(),
    });

    // Linked goal update if provided
    if (goalId) {
      try {
        const goal = await FinancialGoalService.getGoalById(userId, goalId);
        if (goal) {
          const newCurrent = Math.max(0, goal.currentAmount - parsedAmount);
          await FinancialGoalService.updateGoal(userId, goalId, { currentAmount: newCurrent });
        }
      } catch (e) {
        logger.warn(`Could not adjust linked goal #${goalId} during emergency: ${e}`);
      }
    }

    // Misuse / Anomaly Pattern Detection (Non-judgmental)
    const anomaly = await this.detectEmergencyAnomalies(
      userId,
      parsedAmount,
      wallet.balance,
      impact.runwayAfterMonths
    );

    // Notify accountability partner AFTER execution
    const partners = await DatabaseService.getAccountabilityPartners(userId);
    const activePartners = partners.filter(p => p.status === 'active');
    let partnersNotifiedCount = 0;

    for (const partner of activePartners) {
      try {
        await DatabaseService.createPartnerNotification({
          userId,
          partnerId: partner.id,
          partnerEmail: partner.email,
          type: 'emergency_withdrawal',
          title: '🚨 Emergency Withdrawal Executed',
          message: `User #${userId} executed an emergency withdrawal of $${parsedAmount.toFixed(2)} for '${category}'. Reason: "${trimmedReason}"`,
          details: {
            requestId: request.id,
            amount: parsedAmount,
            category,
            reason: trimmedReason,
            runwayAfterMonths: impact.runwayAfterMonths,
            timestamp: new Date(),
          },
        });
        partnersNotifiedCount++;
      } catch (error) {
        logger.error(`Failed to record notification for partner ${partner.id}: ${error}`);
      }
    }

    // Comprehensive Audit Event
    await DatabaseService.logAuditEvent({
      userId,
      action: 'emergency_withdrawal_executed',
      resource: 'withdrawal_requests',
      status: 'success',
      details: {
        requestId: request.id,
        amount: parsedAmount,
        category,
        reason: trimmedReason,
        transactionId: transaction.id,
        remainingBalance: wallet.balance - parsedAmount,
        partnersNotifiedCount,
        anomalyDetected: anomaly.anomalyDetected,
      },
    });

    if (anomaly.anomalyDetected) {
      await DatabaseService.logAuditEvent({
        userId,
        action: 'emergency_anomaly_detected',
        resource: 'withdrawal_requests',
        status: 'warning',
        details: {
          requestId: request.id,
          warnings: anomaly.warnings,
          recentEmergencyCount7d: anomaly.recentEmergencyCount7d,
        },
      });
    }

    logger.info(
      `Emergency withdrawal #${request.id} executed for user ${userId}: $${parsedAmount} (Partners notified: ${partnersNotifiedCount})`
    );

    return {
      request,
      transaction,
      impact,
      anomaly,
      partnersNotified: partnersNotifiedCount,
      message: `Emergency withdrawal of $${parsedAmount.toFixed(2)} executed immediately. Accountability partner(s) notified.`,
    };
  }

  /**
   * Detect unusual patterns or high frequency in emergency usage.
   * Objective, supportive, and non-accusatory.
   */
  static async detectEmergencyAnomalies(
    userId: number,
    amount: number,
    currentBalance: number,
    runwayAfterMonths: number
  ): Promise<EmergencyAnomalyResult> {
    const warnings: string[] = [];

    // Query historical emergency withdrawals
    const recent7d = await DatabaseService.getEmergencyWithdrawals(userId, 7);
    const recent30d = await DatabaseService.getEmergencyWithdrawals(userId, 30);
    const allEmergency = await DatabaseService.getEmergencyWithdrawals(userId);

    const recentCount7d = recent7d.length;
    const recentCount30d = recent30d.length;
    const totalCount = allEmergency.length;

    // 1. Frequency Anomaly Check
    if (recentCount7d >= 2) {
      warnings.push(
        "You've made several emergency withdrawals recently. Consider reviewing your emergency fund."
      );
    } else if (recentCount30d >= 3) {
      warnings.push(
        'Multiple emergency withdrawals detected within the last 30 days. It may help to review your short-term liquidity buffer.'
      );
    }

    // 2. High Balance Depletion Anomaly Check
    const balanceDepletionPercent =
      currentBalance > 0 ? Math.round((amount / currentBalance) * 100) : 100;

    if (balanceDepletionPercent >= 50) {
      warnings.push(
        `This withdrawal utilizes ${balanceDepletionPercent}% of your available wallet balance. Take care to preserve essential liquidity.`
      );
    }

    // 3. Essential Runway Hazard Check
    if (runwayAfterMonths < 1.0) {
      warnings.push(
        `This withdrawal reduces your essential expense runway to ${runwayAfterMonths.toFixed(1)} months.`
      );
    }

    // 4. Magnitude Anomaly Check against past emergency withdrawals
    if (allEmergency.length >= 2) {
      const pastTotal = allEmergency.reduce((sum, w) => sum + w.amount, 0);
      const avgPast = pastTotal / allEmergency.length;
      if (amount > avgPast * 3 && amount > 500) {
        warnings.push('This request differs from your normal spending pattern.');
      }
    }

    return {
      anomalyDetected: warnings.length > 0,
      warnings,
      recentEmergencyCount7d: recentCount7d,
      recentEmergencyCount30d: recentCount30d,
      totalEmergencyCount: totalCount,
      balanceDepletionPercent,
      remainingRunwayMonths: runwayAfterMonths,
    };
  }

  /**
   * Get active pattern advisories for a user's emergency profile
   */
  static async getEmergencyPatterns(userId: number): Promise<EmergencyAnomalyResult> {
    const wallet = await WalletService.getWallet(userId);
    const dummyImpact = await ImpactAnalysisService.analyzePreTransactionImpact(
      userId,
      0,
      'emergency'
    );
    return this.detectEmergencyAnomalies(
      userId,
      0,
      wallet.balance,
      dummyImpact.runwayBeforeMonths
    );
  }

  /**
   * Get partner notifications feed for partner or user
   */
  static async getNotifications(
    userId?: number,
    partnerEmail?: string
  ): Promise<PartnerNotification[]> {
    return DatabaseService.getPartnerNotifications(userId, partnerEmail);
  }

  /**
   * Mark partner notification as read
   */
  static async markNotificationRead(notificationId: number): Promise<boolean> {
    return DatabaseService.markPartnerNotificationRead(notificationId);
  }
}
