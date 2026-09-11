import { Request, Response } from 'express';
import { FinancialGoalService } from '../services/financialGoalService.js';
import { logger } from '../utils/logger.js';

export const listGoals = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1; // Default to demo user 1 if guest
    const goals = await FinancialGoalService.getGoals(userId);
    const summary = await FinancialGoalService.calculateFinancialFoundation(userId);

    return res.json({
      success: true,
      summary,
      goals,
    });
  } catch (error: any) {
    logger.error(`Error listing goals: ${error.message}`);
    return res.status(500).json({ error: 'Failed to retrieve goals', details: error.message });
  }
};

export const getGoal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const goalId = parseInt(req.params.id, 10);
    if (isNaN(goalId)) {
      return res.status(400).json({ error: 'Invalid goal ID' });
    }

    const goal = await FinancialGoalService.getGoalById(userId, goalId);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    return res.json({ success: true, goal });
  } catch (error: any) {
    logger.error(`Error getting goal: ${error.message}`);
    return res.status(500).json({ error: 'Failed to retrieve goal', details: error.message });
  }
};

export const createGoal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required to create goals' });
    }

    const { name, targetAmount, currentAmount, targetDate, category, priority } = req.body;
    if (!name || targetAmount === undefined) {
      return res.status(400).json({ error: 'Name and targetAmount are required' });
    }

    if (Number(targetAmount) <= 0) {
      return res.status(400).json({ error: 'targetAmount must be greater than 0' });
    }

    const newGoal = await FinancialGoalService.createGoal(userId, {
      name,
      targetAmount: Number(targetAmount),
      currentAmount: currentAmount ? Number(currentAmount) : 0,
      targetDate,
      category,
      priority,
    });

    return res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      goal: newGoal,
    });
  } catch (error: any) {
    logger.error(`Error creating goal: ${error.message}`);
    return res.status(500).json({ error: 'Failed to create goal', details: error.message });
  }
};

export const updateGoal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required to update goals' });
    }

    const goalId = parseInt(req.params.id, 10);
    if (isNaN(goalId)) {
      return res.status(400).json({ error: 'Invalid goal ID' });
    }

    const updated = await FinancialGoalService.updateGoal(userId, goalId, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    return res.json({
      success: true,
      message: 'Goal updated successfully',
      goal: updated,
    });
  } catch (error: any) {
    logger.error(`Error updating goal: ${error.message}`);
    return res.status(500).json({ error: 'Failed to update goal', details: error.message });
  }
};

export const deleteGoal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required to delete goals' });
    }

    const goalId = parseInt(req.params.id, 10);
    if (isNaN(goalId)) {
      return res.status(400).json({ error: 'Invalid goal ID' });
    }

    const success = await FinancialGoalService.deleteGoal(userId, goalId);
    if (!success) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    return res.json({
      success: true,
      message: 'Goal deleted successfully',
    });
  } catch (error: any) {
    logger.error(`Error deleting goal: ${error.message}`);
    return res.status(500).json({ error: 'Failed to delete goal', details: error.message });
  }
};

export const contributeGoal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required to contribute to goals' });
    }

    const goalId = parseInt(req.params.id, 10);
    const { amount } = req.body;
    if (isNaN(goalId) || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Valid goal ID and positive contribution amount are required' });
    }

    const updated = await FinancialGoalService.contributeToGoal(userId, goalId, Number(amount));
    return res.json({
      success: true,
      message: 'Contribution recorded successfully',
      goal: updated,
    });
  } catch (error: any) {
    logger.error(`Error contributing to goal: ${error.message}`);
    return res.status(500).json({ error: error.message || 'Failed to contribute to goal' });
  }
};

export const getFoundationSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const summary = await FinancialGoalService.calculateFinancialFoundation(userId);
    return res.json({ success: true, summary });
  } catch (error: any) {
    logger.error(`Error getting foundation summary: ${error.message}`);
    return res.status(500).json({ error: 'Failed to calculate foundation summary', details: error.message });
  }
};
