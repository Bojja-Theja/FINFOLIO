import { buildLoanRecommendation } from '../services/loanRecommendationService';

describe('loanRecommendationService affordability math', () => {
  test('returns FOIR and max affordable EMI boundaries', async () => {
    const result = await buildLoanRecommendation({
      annualIncome: 960000,
      monthlyExpenses: 32000,
      existingEmi: 7000,
      desiredLoanAmount: 600000,
      tenureMonths: 60,
      creditScore: 720,
      employmentYears: 4,
      loanType: 'education_loan',
    });

    expect(result.affordability.monthlyIncome).toBe(80000);
    expect(result.affordability.maxAllowedFoir).toBe(45);
    expect(result.affordability.maxAffordableEmi).toBeGreaterThanOrEqual(0);
    expect(result.affordability.foirAfterLoan).toBeGreaterThan(0);
  });
});
