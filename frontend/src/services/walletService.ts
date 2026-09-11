import { apiClient } from './apiClient';

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'adjustment';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Wallet {
  id: number;
  userId: number;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: number;
  walletId: number;
  userId: number;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  category: string;
  reason?: string;
  referenceId?: string;
  createdAt: string;
}

export interface WalletSummaryResponse {
  success: boolean;
  wallet: Wallet;
  totalDeposited: number;
  totalWithdrawn: number;
  netSavings: number;
  transactionCount: number;
  recentTransactions: WalletTransaction[];
}

export const walletService = {
  async getWallet(): Promise<WalletSummaryResponse> {
    const response = await apiClient.get('/api/wallet');
    return response.data;
  },

  async deposit(
    amount: number,
    category: string = 'general_savings',
    reason: string = 'Manual deposit'
  ): Promise<{ success: boolean; wallet: Wallet; transaction: WalletTransaction; message: string }> {
    const response = await apiClient.post('/api/wallet/deposit', { amount, category, reason });
    return response.data;
  },

  async withdraw(
    amount: number,
    category: string = 'general_withdrawal',
    reason: string = 'Discretionary withdrawal'
  ): Promise<{ success: boolean; wallet: Wallet; transaction: WalletTransaction; message: string }> {
    const response = await apiClient.post('/api/wallet/withdraw', { amount, category, reason });
    return response.data;
  },

  async getTransactions(
    limit: number = 50
  ): Promise<{ success: boolean; count: number; transactions: WalletTransaction[] }> {
    const response = await apiClient.get(`/api/wallet/transactions?limit=${limit}`);
    return response.data;
  },
};
