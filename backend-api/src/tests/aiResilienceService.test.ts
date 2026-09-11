import { AIResilienceService } from '../services/aiResilienceService.js';
import { DatabaseService } from '../services/databaseService.js';
import { WalletService } from '../services/walletService.js';
import { FinancialGoalService } from '../services/financialGoalService.js';

describe('AIResilienceService', () => {
  const testUserId = 88;

  beforeAll(async () => {
    // Initialize wallet and sample goal for test user
    await WalletService.deposit(testUserId, 1500, 'deposit', 'Initial test deposit');
    await FinancialGoalService.createGoal(testUserId, {
      name: 'Emergency Cushion',
      targetAmount: 5000,
      currentAmount: 1500,
      targetDate: '2027-01-01',
      priority: 'high',
      category: 'emergency_fund',
    });
  });

  afterAll(() => {
    FinancialGoalService.resetInMemoryGoals();
  });

  test('should generate holistic resilience summary with deterministic foundation', async () => {
    const summary = await AIResilienceService.getResilienceSummary(testUserId);

    expect(summary).toBeDefined();
    expect(summary.deterministicBase).toBeDefined();
    expect(summary.deterministicBase.userId).toBe(testUserId);
    expect(summary.deterministicBase.walletBalance).toBeGreaterThanOrEqual(1500);
    expect(summary.deterministicBase.healthScore).toBeGreaterThanOrEqual(0);
    expect(summary.deterministicBase.healthScore).toBeLessThanOrEqual(100);
    expect(typeof summary.deterministicBase.healthGrade).toBe('string');
    expect(typeof summary.deterministicBase.savingsRate).toBe('number');
    expect(typeof summary.deterministicBase.runwayMonths).toBe('number');
  });

  test('should generate multi-scenario runway projections correctly ordered', async () => {
    const summary = await AIResilienceService.getResilienceSummary(testUserId);
    const scenarios = summary.deterministicBase.runwayScenarios;

    expect(scenarios).toBeDefined();
    expect(scenarios.conservativeMonths).toBeLessThanOrEqual(scenarios.baselineMonths + 0.01);
    expect(scenarios.baselineMonths).toBeLessThanOrEqual(scenarios.optimisticMonths + 0.01);
  });

  test('should provide non-judgmental contextual insights across all key topics', async () => {
    const summary = await AIResilienceService.getResilienceSummary(testUserId);

    expect(summary.contextualInsights.length).toBeGreaterThanOrEqual(3);
    const topics = summary.contextualInsights.map((i) => i.topic);
    expect(topics).toContain('runway');
    expect(topics).toContain('savings_goal');
    expect(topics).toContain('accountability');

    // Verify non-accusatory and objective language
    summary.contextualInsights.forEach((insight) => {
      expect(insight.title).toBeDefined();
      expect(insight.fact).toBeDefined();
      expect(insight.consequence).toBeDefined();
      expect(insight.actionableGuidance).toBeDefined();
      expect(['positive', 'neutral', 'advisory']).toContain(insight.sentiment);

      // Check tone does not use judgmental words
      const fullText = `${insight.fact} ${insight.consequence} ${insight.actionableGuidance}`.toLowerCase();
      expect(fullText).not.toContain('reckless');
      expect(fullText).not.toContain('foolish');
      expect(fullText).not.toContain('irresponsible');
    });
  });

  test('should provide executive summary and confidence metric', async () => {
    const summary = await AIResilienceService.getResilienceSummary(testUserId);

    expect(typeof summary.executiveSummary).toBe('string');
    expect(summary.executiveSummary.length).toBeGreaterThan(30);
    expect(summary.executiveSummary).toContain('FinFolio Resilience Assessment');
    expect(summary.mlConfidence).toBeGreaterThan(0.5);
    expect(summary.mlConfidence).toBeLessThanOrEqual(1.0);
  });

  test('should detect liquidity or goal anomalies when conditions warrant', async () => {
    const lowLiquidityUserId = 99;
    // user 99 has empty wallet
    const summary = await AIResilienceService.getResilienceSummary(lowLiquidityUserId);

    expect(summary.anomalies).toBeDefined();
    const hasLiquidityNotice = summary.anomalies.some((a) => a.type === 'liquidity_depletion');
    expect(hasLiquidityNotice).toBe(true);
  });
});
