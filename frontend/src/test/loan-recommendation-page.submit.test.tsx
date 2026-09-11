import { describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LoanRecommendationPage from '@/pages/loan-recommendation';
import api from '@/utils/axiosClient';

vi.mock('@/utils/axiosClient', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('LoanRecommendationPage submit', () => {
  test('submits and renders recommendation payload', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        decision: 'approved',
        approvalProbability: 82.3,
        recommendedInterestRate: 10.2,
        expectedEmi: 17500,
        maxEligibleLoanAmount: 950000,
        riskBand: 'low',
        affordability: {
          monthlyIncome: 100000,
          foirAfterLoan: 38.1,
          maxAllowedFoir: 45,
          maxAffordableEmi: 23000,
        },
        historicalSignals: {
          loanType: 'personal_loan',
          historicalDefaultRate: 6.4,
          benchmarkApprovalRate: 74,
          sampleSize: 6200,
        },
        reasons: ['Credit score is in a favorable band.'],
        recommendations: ['Proceed with lender comparison.'],
      },
    });

    render(<LoanRecommendationPage />);

    fireEvent.click(screen.getByRole('button', { name: /Get Recommendation/i }));

    await waitFor(() => {
      expect(screen.getByText(/Recommendation Result/i)).toBeTruthy();
      expect(screen.getByText(/82.3%/i)).toBeTruthy();
      expect(screen.getByText(/Proceed with lender comparison/i)).toBeTruthy();
    });
  });
});
