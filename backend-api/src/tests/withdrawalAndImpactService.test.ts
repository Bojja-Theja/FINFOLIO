import { describe, it, expect, beforeAll } from 'vitest';
import { ImpactAnalysisService } from '../services/impactAnalysisService';
import { WithdrawalService } from '../services/withdrawalService';
import { WalletService } from '../services/walletService';
import { AccountabilityService } from '../services/accountabilityService';
import { DatabaseService } from '../services/databaseService';

describe('FinFolio Phase 5: Withdrawal + Deterministic Impact Analysis', () => {
  const userId = 101;

  beforeAll(async () => {
    // Seed wallet with funds for testing
    await WalletService.deposit(userId, 5000, 'initial_deposit', 'Seed testing funds');

    // Create 3-tier rules for user
    await AccountabilityService.setCommitmentRule(userId, {
      category: 'Groceries',
      level: 'low',
      requiresApproval: false,
      maxInstantAmount: 10000,
    });

    await AccountabilityService.setCommitmentRule(userId, {
      category: 'Work Equipment',
      level: 'medium',
      requiresApproval: true,
      maxInstantAmount: 100,
    });

    await AccountabilityService.setCommitmentRule(userId, {
      category: 'Luxury Gadgets',
      level: 'high',
      requiresApproval: true,
      maxInstantAmount: 0,
    });
  });

  describe('Deterministic Pre-Transaction Consequence Analysis', () => {
    it('should accurately calculate remaining balance and liquidity sufficiency', async () => {
      const impact = await ImpactAnalysisService.analyzePreTransactionImpact(
        userId,
        500,
        'Groceries'
      );

      expect(impact.currentBalance).toBe(5000);
      expect(impact.remainingBalance).toBe(4500);
      expect(impact.hasSufficientBalance).toBe(true);
    });

    it('should compute deterministic goal delay in days and months', async () => {
      // Default monthlyIncome=50000, monthlyExpenses=30000 -> monthlySavings=20000
      // For $2000 withdrawal: delayMonths = 2000 / 20000 = 0.1 months = 3 days
      const impact = await ImpactAnalysisService.analyzePreTransactionImpact(
        userId,
        2000,
        'Luxury Gadgets'
      );

      expect(impact.monthlySavings).toBe(20000);
      expect(impact.delayReliable).toBe(true);
      expect(impact.estimatedDelayDays).toBe(3); // (2000 / 20000) * 30
      expect(impact.delayExplanation).toContain('delay your savings goals by approximately 3 days');
    });

    it('should calculate runway before and after with multi-scenarios', async () => {
      const impact = await ImpactAnalysisService.analyzePreTransactionImpact(
        userId,
        1500,
        'Luxury Gadgets'
      );

      expect(impact.runwayBeforeMonths).toBeGreaterThan(0);
      expect(impact.runwayAfterMonths).toBeLessThan(impact.runwayBeforeMonths);
      expect(impact.runwayImpactMonths).toBeGreaterThanOrEqual(0);

      expect(impact.runwayScenarios.length).toBe(3);
      expect(impact.runwayScenarios[0]?.name).toBe('Current Spending');
      expect(impact.runwayScenarios[1]?.name).toContain('Reduced Spending');
      expect(impact.runwayScenarios[2]?.name).toContain('Severe Expense');
    });

    it('should integrate 3-tier commitment rules evaluation into impact result', async () => {
      // Essential
      const impactEssential = await ImpactAnalysisService.analyzePreTransactionImpact(
        userId,
        200,
        'Groceries'
      );
      expect(impactEssential.requiresApproval).toBe(false);
      expect(impactEssential.tier).toBe('essential');

      // Important exceeding threshold ($150 > $100)
      const impactImportantOver = await ImpactAnalysisService.analyzePreTransactionImpact(
        userId,
        150,
        'Work Equipment'
      );
      expect(impactImportantOver.requiresApproval).toBe(true);
      expect(impactImportantOver.tier).toBe('important');

      // Discretionary
      const impactDiscretionary = await ImpactAnalysisService.analyzePreTransactionImpact(
        userId,
        80,
        'Luxury Gadgets'
      );
      expect(impactDiscretionary.requiresApproval).toBe(true);
      expect(impactDiscretionary.tier).toBe('discretionary');
    });
  });

  describe('Withdrawal Request State Machine & Atomic Execution', () => {
    it('should execute Essential tier withdrawal immediately and atomically deduct balance', async () => {
      const initialWallet = await WalletService.getWallet(userId);
      const startBalance = initialWallet.balance;

      const result = await WithdrawalService.createWithdrawalRequest(
        userId,
        150,
        'Groceries',
        'Weekly supermarket essentials'
      );

      expect(result.executed).toBe(true);
      expect(result.request.status).toBe('executed');
      expect(result.transaction).toBeDefined();

      const afterWallet = await WalletService.getWallet(userId);
      expect(afterWallet.balance).toBe(startBalance - 150);
    });

    it('should create pending request without deducting balance when approval is required', async () => {
      const initialWallet = await WalletService.getWallet(userId);
      const startBalance = initialWallet.balance;

      const result = await WithdrawalService.createWithdrawalRequest(
        userId,
        600,
        'Luxury Gadgets',
        'Mechanical keyboard purchase'
      );

      expect(result.executed).toBe(false);
      expect(result.request.status).toBe('pending');
      expect(result.transaction).toBeUndefined();

      // STRICT INVARIANT: Balance must NOT have been deducted
      const afterWallet = await WalletService.getWallet(userId);
      expect(afterWallet.balance).toBe(startBalance);
    });

    it('should reject withdrawal request when requested amount exceeds wallet balance', async () => {
      const initialWallet = await WalletService.getWallet(userId);
      const excessiveAmount = initialWallet.balance + 10000;

      await expect(
        WithdrawalService.createWithdrawalRequest(
          userId,
          excessiveAmount,
          'Groceries',
          'Impossible amount'
        )
      ).rejects.toThrow(/insufficient wallet balance/i);
    });

    it('should reject withdrawal request with empty reason or non-positive amount', async () => {
      await expect(
        WithdrawalService.createWithdrawalRequest(userId, 0, 'Groceries', 'Zero test')
      ).rejects.toThrow(/greater than zero/i);

      await expect(
        WithdrawalService.createWithdrawalRequest(userId, 50, 'Groceries', '   ')
      ).rejects.toThrow(/reason is required/i);
    });

    it('should atomically execute approved withdrawal request and prevent double execution', async () => {
      // 1. Create pending request
      const created = await WithdrawalService.createWithdrawalRequest(
        userId,
        300,
        'Luxury Gadgets',
        'Noise cancelling headphones'
      );
      expect(created.request.status).toBe('pending');

      // 2. Transition to approved (simulating partner approval)
      await DatabaseService.updateWithdrawalRequestStatus(
        created.request.id,
        'approved',
        'Approved by partner'
      );

      const preExecutionWallet = await WalletService.getWallet(userId);
      const preBalance = preExecutionWallet.balance;

      // 3. Execute approved request
      const executionResult = await WithdrawalService.executeApprovedWithdrawal(
        userId,
        created.request.id
      );

      expect(executionResult.request.status).toBe('executed');
      expect(executionResult.transaction).toBeDefined();

      const postExecutionWallet = await WalletService.getWallet(userId);
      expect(postExecutionWallet.balance).toBe(preBalance - 300);

      // 4. IDEMPOTENCY GUARD: Attempting to re-execute must be strictly rejected
      await expect(
        WithdrawalService.executeApprovedWithdrawal(userId, created.request.id)
      ).rejects.toThrow(/already been executed/i);
    });

    it('should allow user to cancel a pending withdrawal request', async () => {
      const created = await WithdrawalService.createWithdrawalRequest(
        userId,
        250,
        'Luxury Gadgets',
        'Second thoughts item'
      );
      expect(created.request.status).toBe('pending');

      const cancelled = await WithdrawalService.cancelWithdrawalRequest(
        userId,
        created.request.id
      );
      expect(cancelled.status).toBe('cancelled');

      // Attempting to execute a cancelled request must be rejected
      await expect(
        WithdrawalService.executeApprovedWithdrawal(userId, created.request.id)
      ).rejects.toThrow(/cannot execute a cancelled/i);
    });
  });
});
