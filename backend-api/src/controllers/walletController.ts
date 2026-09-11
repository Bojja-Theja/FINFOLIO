import { Request, Response } from 'express';
import { WalletService } from '../services/walletService';
import { logger } from '../utils/logger';

export const getWallet = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const summary = await WalletService.getWalletSummary(userId);

    return res.json({
      success: true,
      ...summary,
    });
  } catch (error: any) {
    logger.error(`Error retrieving wallet: ${error.message}`);
    return res.status(500).json({ error: 'Failed to retrieve wallet', details: error.message });
  }
};

export const deposit = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required for deposit' });
    }

    const { amount, category, reason, referenceId } = req.body;
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Deposit amount must be a positive number' });
    }

    const result = await WalletService.deposit(
      userId,
      parsedAmount,
      category || 'general_savings',
      reason || 'Manual savings deposit',
      referenceId
    );

    return res.status(200).json({
      success: true,
      message: `Successfully deposited $${parsedAmount.toLocaleString()}`,
      wallet: result.wallet,
      transaction: result.transaction,
    });
  } catch (error: any) {
    logger.error(`Deposit error: ${error.message}`);
    return res.status(400).json({ error: error.message || 'Deposit failed' });
  }
};

export const withdraw = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required for withdrawal' });
    }

    const { amount, category, reason, referenceId } = req.body;
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Withdrawal amount must be a positive number' });
    }

    const result = await WalletService.withdraw(
      userId,
      parsedAmount,
      category || 'general_withdrawal',
      reason || 'Manual savings withdrawal',
      referenceId
    );

    return res.status(200).json({
      success: true,
      message: `Successfully withdrew $${parsedAmount.toLocaleString()}`,
      wallet: result.wallet,
      transaction: result.transaction,
    });
  } catch (error: any) {
    logger.error(`Withdrawal error: ${error.message}`);
    const isInsufficientFunds = error.message && error.message.toLowerCase().includes('insufficient');
    return res.status(isInsufficientFunds ? 400 : 500).json({
      error: error.message || 'Withdrawal failed',
    });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;

    const transactions = await WalletService.getTransactions(userId, limit);

    return res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error: any) {
    logger.error(`Error retrieving transactions: ${error.message}`);
    return res.status(500).json({ error: 'Failed to retrieve transactions', details: error.message });
  }
};
