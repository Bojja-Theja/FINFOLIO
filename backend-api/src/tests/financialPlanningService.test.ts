import { describe, expect, test } from 'vitest';
import {
  buildActionPlan,
  buildCashReservePlan,
  buildDebtPayoffPlan,
  buildEmergencyFundPlan,
  buildExpenseStressTest,
  buildFinancialSnapshot,
  buildIncomeStabilitySummary,
  buildRiskProfileSummary,
  buildSavingsGoalPlan,
  calculateBudgetHealth,
} from '../services/financialPlanningService';

const strongProfile = {
  monthlyIncome: 120000,
  monthlyExpenses: 42000,
  existingEmi: 8000,
  currentSavings: 480000,
  emergencyFund: 480000,
  debtBalance: 220000,
  savingsGoal: 1500000,
  targetMonths: 12,
  creditScore: 780,
  employmentYears: 8,
  jobStability: 8,
  monthlyContribution: 25000,
  incomeVolatility: 0.12,
  expenseGrowthRate: 0.1,
};

describe('financialPlanningService', () => {
  test('calculates budget health', () => {
    const result = calculateBudgetHealth(strongProfile);
    expect(result.score).toBeGreaterThan(50);
    expect(result.status).toBe('healthy');
    expect(result.monthlySurplus).toBeGreaterThan(0);
  });

  test('builds an emergency fund plan', () => {
    const result = buildEmergencyFundPlan(strongProfile);
    expect(result.targetAmount).toBe(252000);
    expect(result.currentCoverageMonths).toBeGreaterThan(6);
    expect(result.status).toBe('good');
  });

  test('builds a debt payoff plan', () => {
    const result = buildDebtPayoffPlan(strongProfile);
    expect(result.totalDebt).toBe(220000);
    expect(result.estimatedPayoffMonths).toBeGreaterThan(0);
    expect(result.estimatedInterestDrag).toBeGreaterThanOrEqual(0);
  });

  test('builds a savings goal plan', () => {
    const result = buildSavingsGoalPlan(strongProfile);
    expect(result.goalAmount).toBe(1500000);
    expect(result.monthlyRequired).toBeGreaterThan(0);
    expect(result.progressPercent).toBeGreaterThan(0);
  });

  test('runs an expense stress test', () => {
    const result = buildExpenseStressTest(strongProfile);
    expect(result.stressedIncome).toBeGreaterThan(0);
    expect(['low', 'moderate', 'high']).toContain(result.riskBand);
  });

  test('summarizes income stability', () => {
    const result = buildIncomeStabilitySummary(strongProfile);
    expect(result.score).toBeGreaterThan(50);
    expect(['stable', 'balanced', 'fragile']).toContain(result.band);
  });

  test('summarizes risk profile', () => {
    const result = buildRiskProfileSummary(strongProfile);
    expect(result.score).toBeGreaterThan(50);
    expect(['low', 'moderate', 'high']).toContain(result.band);
  });

  test('builds a cash reserve plan', () => {
    const result = buildCashReservePlan(strongProfile);
    expect(result.targetReserveAmount).toBeGreaterThan(0);
    expect(result.monthlyTopUp).toBeGreaterThan(0);
  });

  test('builds a financial snapshot', () => {
    const result = buildFinancialSnapshot(strongProfile);
    expect(result.overallScore).toBeGreaterThan(50);
    expect(result.grade).toMatch(/[A-D][+]?/);
  });

  test('builds an action plan', () => {
    const result = buildActionPlan(strongProfile);
    expect(result.priorities.length).toBeGreaterThan(0);
    expect(result.nextBestAction.length).toBeGreaterThan(0);
  });
});