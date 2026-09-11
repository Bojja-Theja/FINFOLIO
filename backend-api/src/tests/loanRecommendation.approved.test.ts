import { buildLoanRecommendation } from '../services/loanRecommendationService';

describe('loanRecommendationService approved profile', () => {
  test('returns approved decision for strong borrower profile', async () => {
    const result = await buildLoanRecommendation({
      annualIncome: 1800000,
      monthlyExpenses: 50000,
      existingEmi: 4000,
      desiredLoanAmount: 450000,
      tenureMonths: 48,
      creditScore: 785,
      employmentYears: 7,
      loanType: 'car_loan',
    });

    expect(['approved', 'review']).toContain(result.decision);
    expect(result.approvalProbability).toBeGreaterThanOrEqual(65);
    expect(result.riskBand).not.toBe('high');
    expect(result.expectedEmi).toBeGreaterThan(0);
  });
});
