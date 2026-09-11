import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoanRecommendationPage from '@/pages/loan-recommendation';

vi.mock('@/utils/axiosClient', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('LoanRecommendationPage render', () => {
  test('renders header and profile form', () => {
    render(<LoanRecommendationPage />);
    expect(screen.getByText(/Loan Recommendation Engine/i)).toBeTruthy();
    expect(screen.getByLabelText(/Loan Type/i)).toBeTruthy();
    expect(screen.getByLabelText(/Annual Income/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Get Recommendation/i })).toBeTruthy();
  });
});
