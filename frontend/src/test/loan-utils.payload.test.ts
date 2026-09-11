import { describe, expect, test } from 'vitest';
import { normalizeLoanRequest } from '@/utils/loanRecommendation';

describe('loanRecommendation normalizeLoanRequest', () => {
  test('normalizes request payload numbers', () => {
    const normalized = normalizeLoanRequest({
      annualIncome: 1200000 as unknown as number,
      monthlyExpenses: 35000 as unknown as number,
      existingEmi: undefined as unknown as number,
      desiredLoanAmount: 800000 as unknown as number,
      tenureMonths: 60 as unknown as number,
      creditScore: 735 as unknown as number,
      employmentYears: 5 as unknown as number,
      loanType: 'personal_loan',
    });

    expect(typeof normalized.annualIncome).toBe('number');
    expect(normalized.existingEmi).toBe(0);
    expect(normalized.creditScore).toBe(735);
  });
});
