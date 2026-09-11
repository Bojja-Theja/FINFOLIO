import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Settings from '../pages/settings';

// Mock the Layout and ThemeProvider
vi.mock('../components/Layout', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../components/ThemeProvider', () => ({
    useTheme: () => ({
        mode: 'light',
        toggleTheme: vi.fn(),
    }),
}));

describe('Settings', () => {
    test('renders settings page with title', () => {
        render(<Settings />);
        const headings = screen.getAllByText(/Settings/i);
        expect(headings.length).toBeGreaterThan(0);
    });

    test('displays appearance section with dark mode toggle', () => {
        render(<Settings />);
        expect(screen.getByText(/Appearance/i)).toBeTruthy();
        expect(screen.getByText(/Dark Mode/i)).toBeTruthy();
    });

    test('shows notification preferences', () => {
        render(<Settings />);
        const notifications = screen.getAllByText(/Notifications/i);
        expect(notifications.length).toBeGreaterThan(0);
        expect(screen.getByText(/Email Notifications/i)).toBeTruthy();
        expect(screen.getByText(/Push Notifications/i)).toBeTruthy();
        expect(screen.getByText(/Budget Alerts/i)).toBeTruthy();
    });

    test('displays preferences section', () => {
        render(<Settings />);
        expect(screen.getByText(/Preferences/i)).toBeTruthy();
        const currency = screen.getAllByText(/Currency/i);
        expect(currency.length).toBeGreaterThan(0);
        const language = screen.getAllByText(/Language/i);
        expect(language.length).toBeGreaterThan(0);
    });

    test('shows security options', () => {
        render(<Settings />);
        expect(screen.getByText(/Security/i)).toBeTruthy();
        expect(screen.getByText(/Change Password/i)).toBeTruthy();
        expect(screen.getByText(/Enable Two-Factor Authentication/i)).toBeTruthy();
    });
});
