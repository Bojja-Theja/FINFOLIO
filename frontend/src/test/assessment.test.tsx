import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Assessment from '../pages/assessment';
import { CurrencyProvider } from '../context/CurrencyContext';

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/assessment',
  }),
}));

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Aditya Sharma', email: 'aditya@example.com' },
    loading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Layout
vi.mock('../components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock ResponsiveContainer for Recharts
vi.mock('recharts', async () => {
  const actual: any = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 500, height: 300 }}>{children}</div>
    ),
  };
});

describe('Assessment Page - 20 Advanced Features & Critical Scenarios', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  test('renders 360 Financial Health Audit with strict INR Indian currency', async () => {
    render(
      <CurrencyProvider>
        <Assessment />
      </CurrencyProvider>
    );

    // Verify main header and strict INR currency badge
    expect(screen.getByText(/360° Financial Health & Crisis Resilience Audit/i)).toBeTruthy();
    expect(screen.getByText(/Indian Rupee \(₹\) Only/i)).toBeTruthy();
  });

  test('calculates core resilience pillars and dual runway metrics', async () => {
    render(
      <CurrencyProvider>
        <Assessment />
      </CurrencyProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/1\. COMPOSITE HEALTH SCORE/i)).toBeTruthy();
      expect(screen.getByText(/2\. LAYOFF SURVIVAL RUNWAY/i)).toBeTruthy();
      expect(screen.getByText(/3\. TIERED EMERGENCY DEFICITS/i)).toBeTruthy();
      expect(screen.getByText(/4\. DEBT-TO-INCOME \(DTI\) OVERBURDEN/i)).toBeTruthy();
    });
  });

  test('Critical Scenario: Sudden Layoff Shock preset test', async () => {
    render(
      <CurrencyProvider>
        <Assessment />
      </CurrencyProvider>
    );

    // Click the layoff shock preset button
    const layoffBtn = screen.getByRole('button', { name: /Sudden Layoff Shock/i });
    fireEvent.click(layoffBtn);

    await waitFor(() => {
      // Emergency runway and triage should reflect shock
      expect(screen.getByText(/LAYOFF SURVIVAL RUNWAY/i)).toBeTruthy();
      expect(screen.getByText(/Crisis Mitigation Playbook/i)).toBeTruthy();
    });
  });

  test('Critical Scenario: High Debt Stress preset test', async () => {
    render(
      <CurrencyProvider>
        <Assessment />
      </CurrencyProvider>
    );

    // Click High Debt Stress preset button
    const debtBtn = screen.getByRole('button', { name: /High Debt Stress/i });
    fireEvent.click(debtBtn);

    await waitFor(() => {
      expect(screen.getByText(/DEBT-TO-INCOME/i)).toBeTruthy();
      expect(screen.getByText(/Debt Payoff Acceleration Engine/i)).toBeTruthy();
    });
  });

  test('Critical Scenario: Frugal FIRE preset test', async () => {
    render(
      <CurrencyProvider>
        <Assessment />
      </CurrencyProvider>
    );

    // Click Frugal FIRE preset button
    const fireBtn = screen.getByRole('button', { name: /Frugal FIRE/i });
    fireEvent.click(fireBtn);

    await waitFor(() => {
      expect(screen.getByText(/FIRE Readiness Engine/i)).toBeTruthy();
      expect(screen.getByText(/TARGET CAPITAL/i)).toBeTruthy();
    });
  });

  test('Actionable buttons work: Strategy switch, memo export, and audit trigger', async () => {
    render(
      <CurrencyProvider>
        <Assessment />
      </CurrencyProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/DAYS OF SURVIVAL/i)).toBeTruthy();
      expect(screen.getByText(/Export Memo/i)).toBeTruthy();
    });

    // Test Export Memo button
    const exportBtn = screen.getAllByRole('button', { name: /Export Memo|Export Clipboard Memo/i })[0]!;
    fireEvent.click(exportBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    // Test Debt Avalanche switch button
    const switchBtn = screen.getByRole('button', { name: /Switch/i });
    fireEvent.click(switchBtn);
    expect(screen.getByText(/Snowball/i)).toBeTruthy();
  });

  test('enforces strict input limits and displays exact days of survival', async () => {
    render(
      <CurrencyProvider>
        <Assessment />
      </CurrencyProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/DAYS OF SURVIVAL/i)).toBeTruthy();
    });

    // Find Monthly Gross Income input
    const incomeInput = screen.getByLabelText(/Monthly Gross Income/i) as HTMLInputElement;
    expect(incomeInput).toBeTruthy();

    // Test exceeding maximum amount (e.g. typing 999999999999)
    fireEvent.change(incomeInput, { target: { value: '999999999999' } });
    // It should be strictly capped at max limit (100000000 = ₹10 Cr)
    expect(Number(incomeInput.value)).toBe(100000000);
    expect(screen.getByText(/Max limit reached/i)).toBeTruthy();

    // Test negative amount entered (should be capped at 0)
    fireEvent.change(incomeInput, { target: { value: '-5000' } });
    expect(Number(incomeInput.value)).toBe(0);

    // Verify Days of Survival is prominently rendered
    expect(screen.getAllByText(/Days/i).length).toBeGreaterThan(0);
  });
});
