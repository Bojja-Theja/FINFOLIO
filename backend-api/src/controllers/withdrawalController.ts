import { Request, Response } from 'express';
import { ImpactAnalysisService } from '../services/impactAnalysisService';
import { WithdrawalService } from '../services/withdrawalService';
import { EmergencyService } from '../services/emergencyService';
import { logger } from '../utils/logger';

export const analyzeImpact = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const { amount, category, goalId } = req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({ error: 'Valid positive amount is required.' });
    }

    if (!category) {
      return res.status(400).json({ error: 'Category is required for impact analysis.' });
    }

    const impact = await ImpactAnalysisService.analyzePreTransactionImpact(
      userId,
      parsedAmount,
      category,
      goalId ? parseInt(goalId, 10) : undefined
    );

    return res.json({ success: true, impact });
  } catch (error: any) {
    logger.error(`Error analyzing withdrawal impact: ${error.message}`);
    return res.status(500).json({ error: error.message || 'Failed to analyze impact' });
  }
};

export const requestWithdrawal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const { amount, category, reason, goalId, isEmergency, isOverride } = req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Withdrawal amount must be greater than zero.' });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'A valid reason is required for withdrawal requests.' });
    }

    const result = await WithdrawalService.createWithdrawalRequest(
      userId,
      parsedAmount,
      category || 'general_withdrawal',
      reason.trim(),
      goalId ? parseInt(goalId, 10) : undefined,
      Boolean(isEmergency),
      Boolean(isOverride)
    );

    return res.status(result.executed ? 200 : 202).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    logger.error(`Error creating withdrawal request: ${error.message}`);
    return res.status(400).json({ error: error.message || 'Withdrawal request failed' });
  }
};

export const getWithdrawals = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const withdrawals = await WithdrawalService.getUserWithdrawals(userId);
    return res.json({ success: true, withdrawals });
  } catch (error: any) {
    logger.error(`Error getting withdrawals: ${error.message}`);
    return res.status(500).json({ error: error.message || 'Failed to get withdrawals' });
  }
};

export const getWithdrawalById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const requestId = parseInt(req.params.id as string, 10);
    if (isNaN(requestId)) {
      return res.status(400).json({ error: 'Invalid request ID.' });
    }

    const withdrawal = await WithdrawalService.getWithdrawalById(userId, requestId);
    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal request not found.' });
    }

    return res.json({ success: true, withdrawal });
  } catch (error: any) {
    logger.error(`Error getting withdrawal by id: ${error.message}`);
    return res.status(500).json({ error: error.message || 'Failed to get withdrawal' });
  }
};

export const executeApprovedWithdrawal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const requestId = parseInt(req.params.id as string, 10);
    if (isNaN(requestId)) {
      return res.status(400).json({ error: 'Invalid request ID.' });
    }

    const result = await WithdrawalService.executeApprovedWithdrawal(userId, requestId);
    return res.json({
      success: true,
      message: `Approved withdrawal of $${result.request.amount.toFixed(2)} executed successfully.`,
      ...result,
    });
  } catch (error: any) {
    logger.error(`Error executing approved withdrawal: ${error.message}`);
    return res.status(400).json({ error: error.message || 'Failed to execute withdrawal' });
  }
};

export const cancelWithdrawalRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const requestId = parseInt(req.params.id as string, 10);
    if (isNaN(requestId)) {
      return res.status(400).json({ error: 'Invalid request ID.' });
    }

    const cancelled = await WithdrawalService.cancelWithdrawalRequest(userId, requestId);
    return res.json({
      success: true,
      message: 'Withdrawal request cancelled.',
      request: cancelled,
    });
  } catch (error: any) {
    logger.error(`Error cancelling withdrawal request: ${error.message}`);
    return res.status(400).json({ error: error.message || 'Failed to cancel request' });
  }
};

export const executeEmergency = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const { amount, reason, category, goalId } = req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Emergency withdrawal amount must be greater than zero.' });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'A valid reason is required for emergency withdrawals.' });
    }

    const result = await EmergencyService.executeEmergencyWithdrawal(
      userId,
      parsedAmount,
      reason.trim(),
      category || 'emergency',
      goalId ? parseInt(goalId, 10) : undefined
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    logger.error(`Error executing emergency withdrawal: ${error.message}`);
    return res.status(400).json({ error: error.message || 'Emergency withdrawal failed' });
  }
};

export const getEmergencyPatterns = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const patterns = await EmergencyService.getEmergencyPatterns(userId);
    return res.json({ success: true, patterns });
  } catch (error: any) {
    logger.error(`Error getting emergency patterns: ${error.message}`);
    return res.status(500).json({ error: error.message || 'Failed to retrieve emergency patterns' });
  }
};

export const executeOverride = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const { amount, category, reason, acknowledgement, goalId } = req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Withdrawal amount must be greater than zero.' });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'A valid reason is required for withdrawal requests.' });
    }

    if (!acknowledgement || !acknowledgement.trim()) {
      return res.status(400).json({
        error:
          "Explicit consequence acknowledgement is required to override commitment rules: 'I understand this may delay my goal and reduce my financial runway.'",
      });
    }

    const result = await WithdrawalService.executeConsciousOverride(
      userId,
      parsedAmount,
      category || 'discretionary',
      reason.trim(),
      acknowledgement.trim(),
      goalId ? parseInt(goalId, 10) : undefined
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    logger.error(`Error executing conscious override: ${error.message}`);
    return res.status(400).json({ error: error.message || 'Conscious override failed' });
  }
};


