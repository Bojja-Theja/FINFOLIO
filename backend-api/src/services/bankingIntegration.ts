// TODO: Implement UPI / Bank API integration (future)
// Connect to banking APIs for transaction data, account balances, etc.

export const connectBankAccount = (userId: number, bankDetails: any) => {
  // TODO: Integrate with bank APIs
  console.log(`Connecting bank for user ${userId}`);
  return { success: true, accountId: 'acc_123' };
};

export const fetchTransactions = (userId: number, accountId: string) => {
  // TODO: Fetch recent transactions
  return { transactions: [{ amount: 100, description: 'Grocery' }] };
};