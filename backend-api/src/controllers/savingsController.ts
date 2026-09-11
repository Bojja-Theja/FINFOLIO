import { Request, Response } from 'express';
import {
  lockSavings,
  unlockSavings,
  getSavingsStatus,
  createSavingsPlan,
  getDisciplineInsights,
  enforceDisciplineProtocol,
  checkSpendingLimit,
  autoSaveIncome
} from '../services/savingsService';

export const lock = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { amount, reason } = req.body;
  const result = lockSavings(userId, amount, reason);
  res.json(result);
};

export const unlock = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { planId } = req.params;
  const { reason } = req.body;
  const result = unlockSavings(userId, parseInt(planId), reason);
  res.json(result);
};

export const getStatus = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const result = await getSavingsStatus(userId);
  res.json(result);
};

export const createPlan = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required to create savings plans' });
  }
  
  try {
    const planData = req.body;
    
    // Validate input
    if (!planData.name || !planData.target_amount) {
      return res.status(400).json({ 
        error: 'Name and target amount are required' 
      });
    }

    const result = await createSavingsPlan(userId, planData);
    res.json(result);
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to create savings plan';
    console.error('Create plan error:', errorMessage, error);
    res.status(500).json({ error: errorMessage });
  }
};

export const getInsights = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const result = getDisciplineInsights(userId);
  res.json(result);
};

export const checkTransaction = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const transaction = req.body;
  const result = checkSpendingLimit(userId, transaction);
  res.json(result);
};

export const processTransaction = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const transaction = req.body;
  const result = enforceDisciplineProtocol(userId, transaction);
  res.json(result);
};

export const triggerAutoSave = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { incomeAmount } = req.body;
  const result = autoSaveIncome(userId, incomeAmount);
  res.json(result);
};