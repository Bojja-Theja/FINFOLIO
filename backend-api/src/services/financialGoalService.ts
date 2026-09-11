import { query } from '../config/db';
import { logger } from '../utils/logger';
import { DatabaseService } from './databaseService';
import { WalletService } from './walletService';
import {
  FinancialGoal,
  FinancialGoalWithCalculations,
  GoalCalculations,
  FinancialFoundationSummary,
  GoalPriority,
} from '../models/FinancialGoal';

// In-memory fallback for testing and offline demo
const inMemoryGoals: FinancialGoal[] = [];
let nextGoalId = 1;

export class FinancialGoalService {
  /**
   * Reset in-memory goals (for unit test isolation)
   */
  static resetInMemoryGoals(): void {
    inMemoryGoals.length = 0;
    nextGoalId = 1;
  }

  /**
   * Deterministically calculate percentage progress toward a goal
   */
  static calculateGoalProgress(currentAmount: number, targetAmount: number): number {
    if (targetAmount <= 0) return 100;
    const ratio = (currentAmount / targetAmount) * 100;
    return Math.min(100, Math.max(0, Math.round(ratio * 10) / 10));
  }

  /**
   * Deterministically calculate months remaining until target date
   */
  static calculateMonthsRemaining(targetDateStr?: string | null, referenceDate: Date = new Date()): number {
    if (!targetDateStr) return 0;
    const target = new Date(targetDateStr);
    if (isNaN(target.getTime())) return 0;

    const yearDiff = target.getFullYear() - referenceDate.getFullYear();
    const monthDiff = target.getMonth() - referenceDate.getMonth();
    const dayDiff = (target.getDate() - referenceDate.getDate()) / 30.44;

    const totalMonths = yearDiff * 12 + monthDiff + dayDiff;
    return Math.max(0, Math.round(totalMonths));
  }

  /**
   * Deterministically calculate required monthly contribution to reach target
   */
  static calculateMonthlySavingsNeeded(
    currentAmount: number,
    targetAmount: number,
    monthsRemaining: number
  ): number {
    const gap = Math.max(0, targetAmount - currentAmount);
    if (gap === 0) return 0;
    if (monthsRemaining <= 0) return gap; // All needed immediately if target date has arrived
    return Math.ceil(gap / monthsRemaining);
  }

  /**
   * Deterministically estimate completion date given current amount and monthly savings pace
   */
  static estimateCompletionDate(
    currentAmount: number,
    targetAmount: number,
    monthlyContribution: number,
    referenceDate: Date = new Date()
  ): string {
    const gap = Math.max(0, targetAmount - currentAmount);
    if (gap === 0) {
      return referenceDate.toISOString().split('T')[0];
    }
    if (monthlyContribution <= 0) {
      return 'Indefinite (requires contribution)';
    }

    const monthsNeeded = Math.ceil(gap / monthlyContribution);
    const estimatedDate = new Date(referenceDate);
    estimatedDate.setMonth(estimatedDate.getMonth() + monthsNeeded);
    return estimatedDate.toISOString().split('T')[0];
  }

  /**
   * Deterministically evaluate complete calculation metadata for a goal
   */
  static calculateGoalDetails(
    goal: FinancialGoal,
    userMonthlySavings: number = 0,
    referenceDate: Date = new Date()
  ): GoalCalculations {
    const progressPercent = this.calculateGoalProgress(goal.currentAmount, goal.targetAmount);
    const remainingAmount = Math.max(0, Math.round((goal.targetAmount - goal.currentAmount) * 100) / 100);
    const monthsRemaining = this.calculateMonthsRemaining(goal.targetDate, referenceDate);
    const monthlySavingsNeeded = this.calculateMonthlySavingsNeeded(
      goal.currentAmount,
      goal.targetAmount,
      monthsRemaining
    );

    // If user's available monthly savings pace can cover the required monthly savings, it's on track
    const effectivePace = userMonthlySavings > 0 ? userMonthlySavings : monthlySavingsNeeded;
    const estimatedCompletionDate = this.estimateCompletionDate(
      goal.currentAmount,
      goal.targetAmount,
      effectivePace,
      referenceDate
    );

    let status: GoalCalculations['status'] = 'not_started';
    if (progressPercent >= 100) {
      status = 'completed';
    } else if (progressPercent >= 80) {
      status = 'nearly_there';
    } else if (progressPercent > 0) {
      status = 'in_progress';
    }

    const isOnTrack =
      progressPercent >= 100 ||
      (userMonthlySavings > 0 && userMonthlySavings >= monthlySavingsNeeded);

    return {
      progressPercent,
      remainingAmount,
      monthsRemaining,
      monthlySavingsNeeded,
      estimatedCompletionDate,
      isOnTrack,
      status,
    };
  }

  /**
   * Deterministically compute overall financial foundation summary
   */
  static async calculateFinancialFoundation(userId: number): Promise<FinancialFoundationSummary> {
    const [userData, wallet, goals] = await Promise.all([
      DatabaseService.getUserFinancialData(userId),
      WalletService.getWallet(userId),
      this.getGoals(userId),
    ]);

    const monthlyIncome = userData?.monthlyIncome || 50000;
    const monthlyExpenses = userData?.monthlyExpenses || 30000;
    const monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses);
    const savingsRate = monthlyIncome > 0
      ? Math.round(((monthlySavings / monthlyIncome) * 100) * 10) / 10
      : 0;

    const totalGoalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalGoalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const overallGoalProgress = this.calculateGoalProgress(totalGoalSaved, totalGoalTarget);

    return {
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      savingsRate,
      walletBalance: wallet.balance,
      totalGoalTarget,
      totalGoalSaved,
      overallGoalProgress,
    };
  }

  /**
   * Get all goals for user with calculated deterministic metrics
   */
  static async getGoals(userId: number): Promise<FinancialGoalWithCalculations[]> {
    let rawGoals: FinancialGoal[] = [];

    try {
      const result = await query(
        `SELECT id, user_id, name, target_amount, current_amount, target_date, category, priority, created_at, updated_at
         FROM financial_goals
         WHERE user_id = $1
         ORDER BY priority DESC, created_at ASC`,
        [userId]
      );

      rawGoals = result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        targetAmount: parseFloat(row.target_amount) || 0,
        currentAmount: parseFloat(row.current_amount) || 0,
        targetDate: row.target_date ? new Date(row.target_date).toISOString().split('T')[0] : null,
        category: row.category || 'general',
        priority: (row.priority as GoalPriority) || 'medium',
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }));
    } catch (error) {
      logger.warn(`Failed to fetch financial_goals from database for user ${userId}, using in-memory: ${error}`);
      rawGoals = inMemoryGoals.filter((g) => g.userId === userId);
    }

    // If user has zero goals yet, initialize default demo goals for seamless onboarding
    if (rawGoals.length === 0 && userId === 1) {
      const defaultGoals: Omit<FinancialGoal, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          userId: 1,
          name: 'Emergency Fund Reserve',
          targetAmount: 200000,
          currentAmount: 120000,
          targetDate: '2026-12-31',
          category: 'emergency',
          priority: 'high',
        },
        {
          userId: 1,
          name: 'Home Renovation',
          targetAmount: 500000,
          currentAmount: 180000,
          targetDate: '2027-06-30',
          category: 'housing',
          priority: 'medium',
        },
        {
          userId: 1,
          name: 'Family Vacation',
          targetAmount: 150000,
          currentAmount: 75000,
          targetDate: '2026-11-15',
          category: 'vacation',
          priority: 'low',
        },
      ];

      for (const dg of defaultGoals) {
        const created = await this.createGoal(1, dg);
        rawGoals.push(created);
      }
    }

    // Get user monthly savings to ground calculations
    const userData = await DatabaseService.getUserFinancialData(userId);
    const userMonthlySavings = Math.max(0, (userData?.monthlyIncome || 50000) - (userData?.monthlyExpenses || 30000));

    return rawGoals.map((goal) => ({
      ...goal,
      calculations: this.calculateGoalDetails(goal, userMonthlySavings),
    }));
  }

  /**
   * Get single goal by ID
   */
  static async getGoalById(userId: number, goalId: number): Promise<FinancialGoalWithCalculations | null> {
    const goals = await this.getGoals(userId);
    return goals.find((g) => g.id === goalId) || null;
  }

  /**
   * Create a new financial goal
   */
  static async createGoal(
    userId: number,
    data: {
      name: string;
      targetAmount: number;
      currentAmount?: number;
      targetDate?: string | null;
      category?: string;
      priority?: GoalPriority;
    }
  ): Promise<FinancialGoalWithCalculations> {
    const targetAmount = Math.max(1, Number(data.targetAmount));
    const currentAmount = Math.max(0, Number(data.currentAmount || 0));
    const category = data.category || 'general';
    const priority: GoalPriority = data.priority || 'medium';
    const targetDate = data.targetDate || null;

    let createdGoal: FinancialGoal;

    try {
      const result = await query(
        `INSERT INTO financial_goals (user_id, name, target_amount, current_amount, target_date, category, priority, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING id, user_id, name, target_amount, current_amount, target_date, category, priority, created_at, updated_at`,
        [userId, data.name, targetAmount, currentAmount, targetDate, category, priority]
      );

      const row = result.rows[0];
      createdGoal = {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        targetAmount: parseFloat(row.target_amount),
        currentAmount: parseFloat(row.current_amount),
        targetDate: row.target_date ? new Date(row.target_date).toISOString().split('T')[0] : null,
        category: row.category,
        priority: row.priority as GoalPriority,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    } catch (error) {
      logger.warn(`Failed to insert into financial_goals DB, falling back to in-memory: ${error}`);
      createdGoal = {
        id: nextGoalId++,
        userId,
        name: data.name,
        targetAmount,
        currentAmount,
        targetDate,
        category,
        priority,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryGoals.push(createdGoal);
    }

    const userData = await DatabaseService.getUserFinancialData(userId);
    const userMonthlySavings = Math.max(0, (userData?.monthlyIncome || 50000) - (userData?.monthlyExpenses || 30000));

    return {
      ...createdGoal,
      calculations: this.calculateGoalDetails(createdGoal, userMonthlySavings),
    };
  }

  /**
   * Update an existing goal
   */
  static async updateGoal(
    userId: number,
    goalId: number,
    data: Partial<{
      name: string;
      targetAmount: number;
      currentAmount: number;
      targetDate: string | null;
      category: string;
      priority: GoalPriority;
    }>
  ): Promise<FinancialGoalWithCalculations | null> {
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (data.name !== undefined) {
        updates.push(`name = $${idx++}`);
        values.push(data.name);
      }
      if (data.targetAmount !== undefined) {
        updates.push(`target_amount = $${idx++}`);
        values.push(data.targetAmount);
      }
      if (data.currentAmount !== undefined) {
        updates.push(`current_amount = $${idx++}`);
        values.push(data.currentAmount);
      }
      if (data.targetDate !== undefined) {
        updates.push(`target_date = $${idx++}`);
        values.push(data.targetDate);
      }
      if (data.category !== undefined) {
        updates.push(`category = $${idx++}`);
        values.push(data.category);
      }
      if (data.priority !== undefined) {
        updates.push(`priority = $${idx++}`);
        values.push(data.priority);
      }

      if (updates.length === 0) {
        return await this.getGoalById(userId, goalId);
      }

      updates.push(`updated_at = NOW()`);
      values.push(goalId, userId);

      const result = await query(
        `UPDATE financial_goals
         SET ${updates.join(', ')}
         WHERE id = $${idx++} AND user_id = $${idx++}
         RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const updated: FinancialGoal = {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        targetAmount: parseFloat(row.target_amount),
        currentAmount: parseFloat(row.current_amount),
        targetDate: row.target_date ? new Date(row.target_date).toISOString().split('T')[0] : null,
        category: row.category,
        priority: row.priority,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };

      const userData = await DatabaseService.getUserFinancialData(userId);
      const userMonthlySavings = Math.max(0, (userData?.monthlyIncome || 50000) - (userData?.monthlyExpenses || 30000));

      return {
        ...updated,
        calculations: this.calculateGoalDetails(updated, userMonthlySavings),
      };
    } catch (error) {
      logger.warn(`Failed to update financial_goals in DB, updating in-memory: ${error}`);
      const goal = inMemoryGoals.find((g) => g.id === goalId && g.userId === userId);
      if (!goal) return null;

      if (data.name !== undefined) goal.name = data.name;
      if (data.targetAmount !== undefined) goal.targetAmount = data.targetAmount;
      if (data.currentAmount !== undefined) goal.currentAmount = data.currentAmount;
      if (data.targetDate !== undefined) goal.targetDate = data.targetDate;
      if (data.category !== undefined) goal.category = data.category;
      if (data.priority !== undefined) goal.priority = data.priority;
      goal.updatedAt = new Date();

      const userData = await DatabaseService.getUserFinancialData(userId);
      const userMonthlySavings = Math.max(0, (userData?.monthlyIncome || 50000) - (userData?.monthlyExpenses || 30000));

      return {
        ...goal,
        calculations: this.calculateGoalDetails(goal, userMonthlySavings),
      };
    }
  }

  /**
   * Contribute funds to a goal (increments current amount)
   */
  static async contributeToGoal(
    userId: number,
    goalId: number,
    amount: number
  ): Promise<FinancialGoalWithCalculations> {
    if (amount <= 0) {
      throw new Error('Contribution amount must be strictly greater than 0');
    }

    const goal = await this.getGoalById(userId, goalId);
    if (!goal) {
      throw new Error(`Goal with ID ${goalId} not found for user ${userId}`);
    }

    const newAmount = Math.round((goal.currentAmount + amount) * 100) / 100;
    const updated = await this.updateGoal(userId, goalId, { currentAmount: newAmount });
    if (!updated) {
      throw new Error(`Failed to update goal ${goalId}`);
    }

    return updated;
  }

  /**
   * Delete goal
   */
  static async deleteGoal(userId: number, goalId: number): Promise<boolean> {
    try {
      const result = await query(
        `DELETE FROM financial_goals WHERE id = $1 AND user_id = $2 RETURNING id`,
        [goalId, userId]
      );
      if (result.rows.length > 0) {
        return true;
      }
    } catch (error) {
      logger.warn(`Failed to delete goal in DB, trying in-memory: ${error}`);
    }

    const idx = inMemoryGoals.findIndex((g) => g.id === goalId && g.userId === userId);
    if (idx !== -1) {
      inMemoryGoals.splice(idx, 1);
      return true;
    }
    return false;
  }
}
