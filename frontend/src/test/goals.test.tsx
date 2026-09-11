import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Goals from '../pages/goals';

// Mock the Layout component
vi.mock('../components/Layout', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Goals', () => {
    test('renders goals page with title', () => {
        render(<Goals />);
        expect(screen.getByText(/Financial Goals/i)).toBeTruthy();
    });

    test('displays add new goal button', () => {
        render(<Goals />);
        expect(screen.getByText(/Add New Goal/i)).toBeTruthy();
    });

    test('shows summary cards with goal statistics', () => {
        render(<Goals />);
        expect(screen.getByText(/Total Goals/i)).toBeTruthy();
        const targetAmount = screen.getAllByText(/Target Amount/i);
        expect(targetAmount.length).toBeGreaterThan(0);
        expect(screen.getByText(/Saved So Far/i)).toBeTruthy();
        expect(screen.getByText(/Overall Progress/i)).toBeTruthy();
    });

    test('displays AI recommendations', () => {
        render(<Goals />);
        expect(screen.getByText(/Goal Achievement Recommendations/i)).toBeTruthy();
    });
});
