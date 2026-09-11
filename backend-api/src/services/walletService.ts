import { DatabaseService } from './databaseService';
import { Wallet, WalletTransaction } from '../models/Wallet';
import { logger } from '../utils/logger';

export class WalletService {
  /**
   * Get or initialize a user's wallet
   */
  static async getWallet(userId: number): Promise<Wallet> {
    return await DatabaseService.getOrCreateWallet(userId, 0.00, 'USD');
  }

  /**
   * Check user's current wallet balance
   */
  static async getBalance(userId: number): Promise<number> {
    const wallet = await this.getWallet(userId);
    return wallet.balance;
  }

  /**
   * Verify whether user has sufficient balance for an operation
   */
  static async hasSufficientBalance(userId: number, amount: number): Promise<boolean> {
    if (amount <= 0) return false;
    const balance = await this.getBalance(userId);
    return balance >= amount;
  }

  /**
   * Deposit funds into wallet and record transaction
   */
  static async deposit(
    userId: number,
    amount: number,
    category: string = 'general',
    reason: string = 'Deposit to savings wallet',
    referenceId?: string
  ): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
    if (amount <= 0) {
      throw new Error('Deposit amount must be strictly greater than 0');
    }

    const currentWallet = await this.getWallet(userId);
    const newBalance = Math.round((currentWallet.balance + amount) * 100) / 100;

    const updatedWallet = await DatabaseService.updateWalletBalance(userId, newBalance);

    const transaction = await DatabaseService.createWalletTransaction({
      walletId: updatedWallet.id,
      userId,
      amount,
      type: 'deposit',
      status: 'completed',
      category,
      reason,
      ...(referenceId !== undefined && { referenceId }),
    });

    logger.info(`Deposit successful: user ${userId}, amount +${amount}, new balance: ${newBalance}`);
    return { wallet: updatedWallet, transaction };
  }

  /**
   * Withdraw funds from wallet and record transaction
   * Enforces non-negative balance invariant.
   */
  static async withdraw(
    userId: number,
    amount: number,
    category: string = 'general',
    reason: string = 'Withdrawal from savings wallet',
    referenceId?: string
  ): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be strictly greater than 0');
    }

    const currentWallet = await this.getWallet(userId);

    if (currentWallet.balance < amount) {
      throw new Error(
        `Insufficient funds: current balance is ${currentWallet.balance}, requested ${amount}`
      );
    }

    const newBalance = Math.round((currentWallet.balance - amount) * 100) / 100;
    const updatedWallet = await DatabaseService.updateWalletBalance(userId, newBalance);

    const transaction = await DatabaseService.createWalletTransaction({
      walletId: updatedWallet.id,
      userId,
      amount,
      type: 'withdrawal',
      status: 'completed',
      category,
      reason,
      ...(referenceId !== undefined && { referenceId }),
    });

    logger.info(`Withdrawal executed: user ${userId}, amount -${amount}, new balance: ${newBalance}`);
    return { wallet: updatedWallet, transaction };
  }

  /**
   * Get transaction history for user's wallet
   */
  static async getTransactions(userId: number, limit: number = 50): Promise<WalletTransaction[]> {
    return await DatabaseService.getWalletTransactions(userId, limit);
  }

  /**
   * Get comprehensive wallet summary with totals and recent history
   */
  static async getWalletSummary(userId: number): Promise<{
    wallet: Wallet;
    totalDeposited: number;
    totalWithdrawn: number;
    netSavings: number;
    transactionCount: number;
    recentTransactions: WalletTransaction[];
  }> {
    const wallet = await this.getWallet(userId);
    const transactions = await this.getTransactions(userId, 100);

    const totalDeposited = transactions
      .filter((t) => t.type === 'deposit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawn = transactions
      .filter((t) => t.type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      wallet,
      totalDeposited: Math.round(totalDeposited * 100) / 100,
      totalWithdrawn: Math.round(totalWithdrawn * 100) / 100,
      netSavings: Math.round((totalDeposited - totalWithdrawn) * 100) / 100,
      transactionCount: transactions.length,
      recentTransactions: transactions.slice(0, 10),
    };
  }
}
