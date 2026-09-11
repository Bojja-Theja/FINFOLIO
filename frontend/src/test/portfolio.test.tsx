import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Portfolio from '../pages/portfolio';

// Mock the Layout component
vi.mock('../components/Layout', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Portfolio', () => {
    test('renders portfolio page with title', () => {
        render(<Portfolio />);
        expect(screen.getByText(/Investment Portfolio/i)).toBeTruthy();
    });

    test('displays summary cards', () => {
        render(<Portfolio />);
        expect(screen.getByText(/Portfolio Value/i)).toBeTruthy();
        expect(screen.getByText(/Total Invested/i)).toBeTruthy();
        const returns = screen.getAllByText(/Returns/i);
        expect(returns.length).toBeGreaterThan(0);
    });

    test('shows asset allocation section', () => {
        render(<Portfolio />);
        expect(screen.getByText(/Asset Allocation/i)).toBeTruthy();
    });

    test('displays performance chart', () => {
        render(<Portfolio />);
        const performance = screen.getAllByText(/Portfolio Performance/i);
        expect(performance.length).toBeGreaterThan(0);
    });

    test('shows holdings table', () => {
        render(<Portfolio />);
        expect(screen.getByText(/Holdings/i)).toBeTruthy();
    });

    test('displays rebalancing recommendations', () => {
        render(<Portfolio />);
        expect(screen.getByText(/Rebalancing Recommendations/i)).toBeTruthy();
    });
});
