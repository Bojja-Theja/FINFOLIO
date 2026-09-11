import { buildLoanRecommendation } from '../services/loanRecommendationService';

describe('loanRecommendationService interest pricing', () => {
  test('higher risk profile gets higher recommended interest rate', async () => {
    const lowRisk = await buildLoanRecommendation({
      annualIncome: 1500000,
      monthlyExpenses: 45000,
      existingEmi: 5000,
      desiredLoanAmount: 400000,
      tenureMonths: 60,
      creditScore: 790,
      employmentYears: 8,
      loanType: 'personal_loan',
    });

    const highRisk = await buildLoanRecommendation({
      annualIncome: 1500000,
      monthlyExpenses: 45000,
      existingEmi: 5000,
      desiredLoanAmount: 400000,
      tenureMonths: 60,
      creditScore: 640,
      employmentYears: 1,
      loanType: 'personal_loan',
    });

    expect(highRisk.recommendedInterestRate).toBeGreaterThan(lowRisk.recommendedInterestRate);
  });
});
