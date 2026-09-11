import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BudgetPlanner from '../pages/budget-planner';

// Mock the Layout component
vi.mock('../components/Layout', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('BudgetPlanner', () => {
    test('renders budget planner page with title', () => {
        render(<BudgetPlanner />);
        expect(screen.getByText(/Budget Planner/i)).toBeTruthy();
    });

    test('displays summary cards', () => {
        render(<BudgetPlanner />);
        expect(screen.getByText(/Monthly Income/i)).toBeTruthy();
        expect(screen.getByText(/Total Allocated/i)).toBeTruthy();
        expect(screen.getByText(/Total Spent/i)).toBeTruthy();
        const remaining = screen.getAllByText(/Remaining/i);
        expect(remaining.length).toBeGreaterThan(0);
    });

    test('shows AI recommendations section', () => {
        render(<BudgetPlanner />);
        expect(screen.getByText(/AI Budget Recommendations/i)).toBeTruthy();
    });
});
