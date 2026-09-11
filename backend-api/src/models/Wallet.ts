export interface Wallet {
  id: number;
  userId: number;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export type WalletTransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'adjustment';
export type WalletTransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface WalletTransaction {
  id: number;
  walletId: number;
  userId: number;
  amount: number;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  category: string;
  reason?: string;
  referenceId?: string;
  createdAt: Date;
}
