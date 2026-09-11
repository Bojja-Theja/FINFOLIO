import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaxCalculator from '../pages/tax-calculator';

// Mock the Layout component
vi.mock('../components/Layout', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('TaxCalculator', () => {
    test('renders tax calculator page with title', () => {
        render(<TaxCalculator />);
        expect(screen.getByText(/Tax Optimizer/i)).toBeTruthy();
    });

    test('displays income input section', () => {
        render(<TaxCalculator />);
        expect(screen.getByText(/Financial Inputs/i)).toBeTruthy();
        expect(screen.getByLabelText(/Annual Gross Salary/i)).toBeTruthy();
        expect(screen.getByLabelText(/Section 80C/i)).toBeTruthy();
    });

    test('shows tax summary cards', () => {
        render(<TaxCalculator />);
        expect(screen.getByText(/New Regime/i)).toBeTruthy();
        expect(screen.getAllByText(/Old Regime/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Monthly Take-home/i).length).toBeGreaterThanOrEqual(1);
    });

    test('displays income distribution chart', () => {
        render(<TaxCalculator />);
        expect(screen.getByText(/Regime Comparison/i)).toBeTruthy();
    });

    test('shows tax saving recommendations', () => {
        render(<TaxCalculator />);
        expect(screen.getByText(/Save/i)).toBeTruthy();
    });
});
