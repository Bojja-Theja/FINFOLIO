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
        expect(screen.getByText(/Total Active Goals/i)).toBeTruthy();
        expect(screen.getByText(/Total Goal Target/i)).toBeTruthy();
        expect(screen.getByText(/Total Accumulated/i)).toBeTruthy();
        expect(screen.getByText(/Overall Goal Completion/i)).toBeTruthy();
    });

    test('displays refresh button', () => {
        render(<Goals />);
        expect(screen.getByText(/Refresh/i)).toBeTruthy();
    });
});
