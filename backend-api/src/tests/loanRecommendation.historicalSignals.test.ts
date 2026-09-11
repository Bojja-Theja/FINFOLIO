import { buildLoanRecommendation } from '../services/loanRecommendationService';

describe('loanRecommendationService historical context', () => {
  test('includes historical default and benchmark approval rates', async () => {
    const result = await buildLoanRecommendation({
      annualIncome: 1200000,
      monthlyExpenses: 38000,
      existingEmi: 3000,
      desiredLoanAmount: 2500000,
      tenureMonths: 240,
      creditScore: 760,
      employmentYears: 6,
      loanType: 'home_loan',
    });

    expect(result.historicalSignals.sampleSize).toBeGreaterThan(0);
    expect(result.historicalSignals.historicalDefaultRate).toBeGreaterThanOrEqual(2);
    expect(result.historicalSignals.benchmarkApprovalRate).toBeGreaterThan(50);
  });
});
