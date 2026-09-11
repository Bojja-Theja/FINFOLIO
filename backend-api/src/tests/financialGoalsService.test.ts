import { describe, it, expect, beforeEach } from 'vitest';
import { FinancialGoalService } from '../services/financialGoalService.js';
import { DatabaseService } from '../services/databaseService.js';
import { WalletService } from '../services/walletService.js';

describe('FinFolio Phase 2: Financial Foundation & Deterministic Goals', () => {
  beforeEach(() => {
    DatabaseService.resetInMemoryState();
    DatabaseService.setUseInMemory(true);
    FinancialGoalService.resetInMemoryGoals();
  });

  describe('Deterministic Financial Calculation Utilities', () => {
    it('should deterministically calculate goal progress percentage', () => {
      expect(FinancialGoalService.calculateGoalProgress(0, 10000)).toBe(0);
      expect(FinancialGoalService.calculateGoalProgress(2500, 10000)).toBe(25);
      expect(FinancialGoalService.calculateGoalProgress(7500, 10000)).toBe(75);
      expect(FinancialGoalService.calculateGoalProgress(10000, 10000)).toBe(100);
      // Clamp overachievement to 100%
      expect(FinancialGoalService.calculateGoalProgress(15000, 10000)).toBe(100);
    });

    it('should calculate months remaining from reference date to target date', () => {
      const refDate = new Date('2026-01-01');
      const targetDate = '2026-07-01';

      const months = FinancialGoalService.calculateMonthsRemaining(targetDate, refDate);
      expect(months).toBe(6);

      // Target date in the past should return 0
      const pastMonths = FinancialGoalService.calculateMonthsRemaining('2025-01-01', refDate);
      expect(pastMonths).toBe(0);

      // Null target date returns 0
      expect(FinancialGoalService.calculateMonthsRemaining(null, refDate)).toBe(0);
    });

    it('should calculate monthly savings needed to achieve goal by target date', () => {
      // $10,000 target, $4,000 current => $6,000 gap over 6 months = $1,000 / month
      const needed = FinancialGoalService.calculateMonthlySavingsNeeded(4000, 10000, 6);
      expect(needed).toBe(1000);

      // Goal already met => $0 needed
      const zeroNeeded = FinancialGoalService.calculateMonthlySavingsNeeded(10000, 10000, 6);
      expect(zeroNeeded).toBe(0);

      // 0 months remaining with gap => entire gap needed immediately
      const immediate = FinancialGoalService.calculateMonthlySavingsNeeded(2000, 5000, 0);
      expect(immediate).toBe(3000);
    });

    it('should deterministically estimate completion date based on monthly savings pace', () => {
      const refDate = new Date('2026-01-01');
      // Gap: $6,000 at $1,000/month => 6 months => 2026-07-01
      const estDate = FinancialGoalService.estimateCompletionDate(4000, 10000, 1000, refDate);
      expect(estDate).toBe('2026-07-01');

      // Zero gap => completes today
      const alreadyDone = FinancialGoalService.estimateCompletionDate(10000, 10000, 1000, refDate);
      expect(alreadyDone).toBe('2026-01-01');

      // No contribution pace
      const noPace = FinancialGoalService.estimateCompletionDate(4000, 10000, 0, refDate);
      expect(noPace).toContain('Indefinite');
    });

    it('should classify goal status deterministically', () => {
      const refDate = new Date('2026-01-01');
      const baseGoal = {
        id: 1,
        userId: 1,
        name: 'Car',
        category: 'vehicle',
        priority: 'medium' as const,
        targetDate: '2026-11-01',
        createdAt: refDate,
        updatedAt: refDate,
      };

      const notStarted = FinancialGoalService.calculateGoalDetails(
        { ...baseGoal, targetAmount: 10000, currentAmount: 0 },
        1000,
        refDate
      );
      expect(notStarted.status).toBe('not_started');

      const inProgress = FinancialGoalService.calculateGoalDetails(
        { ...baseGoal, targetAmount: 10000, currentAmount: 3000 },
        1000,
        refDate
      );
      expect(inProgress.status).toBe('in_progress');

      const nearlyThere = FinancialGoalService.calculateGoalDetails(
        { ...baseGoal, targetAmount: 10000, currentAmount: 8500 },
        1000,
        refDate
      );
      expect(nearlyThere.status).toBe('nearly_there');

      const completed = FinancialGoalService.calculateGoalDetails(
        { ...baseGoal, targetAmount: 10000, currentAmount: 10000 },
        1000,
        refDate
      );
      expect(completed.status).toBe('completed');
    });
  });

  describe('Financial Foundation Summary (Income, Expenses, Savings Rate)', () => {
    it('should compute deterministic income, expenses, monthly savings, and savings rate', async () => {
      // User 1 profile in DatabaseService has monthlyIncome: 52000, monthlyExpenses: 31000
      const summary = await FinancialGoalService.calculateFinancialFoundation(1);

      expect(summary.monthlyIncome).toBe(52000);
      expect(summary.monthlyExpenses).toBe(31000);
      expect(summary.monthlySavings).toBe(21000); // 52000 - 31000
      // Savings rate = (21000 / 52000) * 100 = 40.38% -> 40.4%
      expect(summary.savingsRate).toBe(40.4);
      expect(summary.walletBalance).toBe(0);
    });
  });

  describe('Goal Lifecycle & Contributions', () => {
    const testUserId = 99;

    it('should create and retrieve a financial goal with deterministic calculations', async () => {
      const created = await FinancialGoalService.createGoal(testUserId, {
        name: 'Emergency Buffer',
        targetAmount: 50000,
        currentAmount: 15000,
        targetDate: '2026-12-31',
        category: 'emergency',
        priority: 'high',
      });

      expect(created.id).toBeDefined();
      expect(created.name).toBe('Emergency Buffer');
      expect(created.targetAmount).toBe(50000);
      expect(created.currentAmount).toBe(15000);
      expect(created.calculations.progressPercent).toBe(30);
      expect(created.calculations.remainingAmount).toBe(35000);

      const allGoals = await FinancialGoalService.getGoals(testUserId);
      expect(allGoals.length).toBe(1);
      expect(allGoals[0].name).toBe('Emergency Buffer');
    });

    it('should contribute funds to a goal and update progress deterministically', async () => {
      const goal = await FinancialGoalService.createGoal(testUserId, {
        name: 'Vacation Trip',
        targetAmount: 20000,
        currentAmount: 5000,
        category: 'vacation',
        priority: 'medium',
      });

      expect(goal.calculations.progressPercent).toBe(25);

      const updated = await FinancialGoalService.contributeToGoal(testUserId, goal.id, 5000);

      expect(updated.currentAmount).toBe(10000);
      expect(updated.calculations.progressPercent).toBe(50);
      expect(updated.calculations.remainingAmount).toBe(10000);
    });

    it('should update and delete a goal cleanly', async () => {
      const goal = await FinancialGoalService.createGoal(testUserId, {
        name: 'Old Gadget',
        targetAmount: 8000,
        category: 'electronics',
      });

      const modified = await FinancialGoalService.updateGoal(testUserId, goal.id, {
        name: 'New Laptop',
        targetAmount: 12000,
      });

      expect(modified?.name).toBe('New Laptop');
      expect(modified?.targetAmount).toBe(12000);

      const deleted = await FinancialGoalService.deleteGoal(testUserId, goal.id);
      expect(deleted).toBe(true);

      const remaining = await FinancialGoalService.getGoals(testUserId);
      expect(remaining.length).toBe(0);
    });
  });
});
