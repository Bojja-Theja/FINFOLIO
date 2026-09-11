import { buildLoanRecommendation } from '../services/loanRecommendationService';

describe('loanRecommendationService declined profile', () => {
  test('returns declined decision for stretched affordability and low credit', async () => {
    const result = await buildLoanRecommendation({
      annualIncome: 420000,
      monthlyExpenses: 26000,
      existingEmi: 12000,
      desiredLoanAmount: 900000,
      tenureMonths: 24,
      creditScore: 610,
      employmentYears: 1,
      loanType: 'personal_loan',
    });

    expect(result.decision).toBe('declined');
    expect(result.riskBand).toBe('high');
    expect(result.recommendations.length).toBeGreaterThan(0);
  });
});
