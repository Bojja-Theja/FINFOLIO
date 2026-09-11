import { describe, it, expect, beforeEach } from 'vitest';
import { WalletService } from '../services/walletService';
import { DatabaseService } from '../services/databaseService';

describe('FinFolio Phase 3: Simulated Wallet & Auditable Ledger', () => {
  const userId = 105;

  beforeEach(() => {
    DatabaseService.resetInMemoryState();
    DatabaseService.setUseInMemory(true);
  });

  describe('Wallet Lifecycle & Initialization', () => {
    it('should initialize a wallet with zero balance and USD currency', async () => {
      const wallet = await WalletService.getWallet(userId);

      expect(wallet).toBeDefined();
      expect(wallet.userId).toBe(userId);
      expect(wallet.balance).toBe(0);
      expect(wallet.currency).toBe('USD');
    });

    it('should return the same wallet idempotently on subsequent calls', async () => {
      const w1 = await WalletService.getWallet(userId);
      const w2 = await WalletService.getWallet(userId);

      expect(w1.id).toBe(w2.id);
      expect(w1.userId).toBe(w2.userId);
    });
  });

  describe('Atomic Deposits & Ledger Audit', () => {
    it('should deposit funds, increment balance, and create a ledger record', async () => {
      const { wallet, transaction } = await WalletService.deposit(
        userId,
        1500.75,
        'salary_allocation',
        'Direct monthly deposit'
      );

      expect(wallet.balance).toBe(1500.75);
      expect(transaction.amount).toBe(1500.75);
      expect(transaction.type).toBe('deposit');
      expect(transaction.status).toBe('completed');
      expect(transaction.category).toBe('salary_allocation');
      expect(transaction.reason).toBe('Direct monthly deposit');

      const currentBalance = await WalletService.getBalance(userId);
      expect(currentBalance).toBe(1500.75);
    });

    it('should reject non-positive deposit amounts', async () => {
      await expect(WalletService.deposit(userId, 0)).rejects.toThrow(/greater than 0/i);
      await expect(WalletService.deposit(userId, -100)).rejects.toThrow(/greater than 0/i);
    });
  });

  describe('Atomic Withdrawals & Balance Invariance', () => {
    beforeEach(async () => {
      await WalletService.deposit(userId, 2000.00, 'initial_funds', 'Setup');
    });

    it('should withdraw funds within balance and create a completed withdrawal record', async () => {
      const { wallet, transaction } = await WalletService.withdraw(
        userId,
        450.00,
        'planned_expense',
        'Home maintenance'
      );

      expect(wallet.balance).toBe(1550.00);
      expect(transaction.amount).toBe(450.00);
      expect(transaction.type).toBe('withdrawal');
      expect(transaction.status).toBe('completed');

      const balance = await WalletService.getBalance(userId);
      expect(balance).toBe(1550.00);
    });

    it('should reject withdrawal exceeding balance and strictly maintain balance invariant', async () => {
      await expect(
        WalletService.withdraw(userId, 2500.00, 'luxury', 'Over budget shopping')
      ).rejects.toThrow(/insufficient funds/i);

      // Balance must remain unchanged at 2000.00
      const balance = await WalletService.getBalance(userId);
      expect(balance).toBe(2000.00);
    });

    it('should reject non-positive withdrawal amounts', async () => {
      await expect(WalletService.withdraw(userId, 0)).rejects.toThrow(/greater than 0/i);
      await expect(WalletService.withdraw(userId, -50)).rejects.toThrow(/greater than 0/i);
    });
  });

  describe('Liquidity Verification & Summary Aggregation', () => {
    it('should accurately report hasSufficientBalance', async () => {
      await WalletService.deposit(userId, 1000.00);

      expect(await WalletService.hasSufficientBalance(userId, 500)).toBe(true);
      expect(await WalletService.hasSufficientBalance(userId, 1000)).toBe(true);
      expect(await WalletService.hasSufficientBalance(userId, 1001)).toBe(false);
      expect(await WalletService.hasSufficientBalance(userId, 0)).toBe(false);
      expect(await WalletService.hasSufficientBalance(userId, -100)).toBe(false);
    });

    it('should compute comprehensive wallet summary with totals and recent history', async () => {
      await WalletService.deposit(userId, 2000, 'salary', 'Paycheck');
      await WalletService.deposit(userId, 500, 'bonus', 'Quarterly bonus');
      await WalletService.withdraw(userId, 300, 'groceries', 'Food');
      await WalletService.withdraw(userId, 200, 'utilities', 'Electric bill');

      const summary = await WalletService.getWalletSummary(userId);

      expect(summary.wallet.balance).toBe(2000);
      expect(summary.totalDeposited).toBe(2500);
      expect(summary.totalWithdrawn).toBe(500);
      expect(summary.netSavings).toBe(2000);
      expect(summary.transactionCount).toBe(4);
      expect(summary.recentTransactions.length).toBe(4);
    });
  });
});
