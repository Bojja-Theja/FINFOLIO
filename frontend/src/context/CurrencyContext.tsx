'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CurrencyCode = 'INR';
export type SupportedCurrency = CurrencyCode;

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)', rate: 1.0 },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  currencyInfo: CurrencyInfo;
  setCurrency: (code: CurrencyCode) => void;
  formatAmount: (amount: number, options?: { compact?: boolean; decimals?: number }) => string;
  convertAmount: (amount: number) => number;
}

const defaultFormatINR = (val: number, options?: { compact?: boolean; decimals?: number }): string => {
  const num = Number(val || 0);
  const decimals = options?.decimals !== undefined ? options.decimals : 0;

  if (options?.compact) {
    if (Math.abs(num) >= 10_000_000) {
      return `₹${(num / 10_000_000).toFixed(decimals > 0 ? decimals : 2)} Cr`;
    }
    if (Math.abs(num) >= 100_000) {
      return `₹${(num / 100_000).toFixed(decimals > 0 ? decimals : 1)} L`;
    }
    if (Math.abs(num) >= 1_000) {
      return `₹${(num / 1_000).toFixed(decimals > 0 ? decimals : 1)}k`;
    }
  }

  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `₹${formatted}`;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'INR',
  currencyInfo: CURRENCIES.INR,
  setCurrency: () => {},
  formatAmount: defaultFormatINR,
  convertAmount: (val) => val,
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>('INR');

  useEffect(() => {
    try {
      localStorage.setItem('finfolio_currency', 'INR');
    } catch {
      // ignore
    }
  }, []);

  const setCurrency = (_code: CurrencyCode) => {
    // Strictly preserve INR
    setCurrencyState('INR');
  };

  const currencyInfo = CURRENCIES.INR;

  const convertAmount = (amount: number): number => {
    if (!amount || isNaN(amount)) return 0;
    return amount;
  };

  const formatAmount = (
    amount: number,
    options?: { compact?: boolean; decimals?: number }
  ): string => {
    return defaultFormatINR(amount, options);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyInfo,
        setCurrency,
        formatAmount,
        convertAmount,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
