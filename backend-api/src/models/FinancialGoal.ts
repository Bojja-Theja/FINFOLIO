export type GoalPriority = 'low' | 'medium' | 'high';

export interface FinancialGoal {
  id: number;
  userId: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string | null;
  category: string;
  priority: GoalPriority;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalCalculations {
  progressPercent: number;
  remainingAmount: number;
  monthsRemaining: number;
  monthlySavingsNeeded: number;
  estimatedCompletionDate: string;
  isOnTrack: boolean;
  status: 'not_started' | 'in_progress' | 'nearly_there' | 'completed';
}

export interface FinancialGoalWithCalculations extends FinancialGoal {
  calculations: GoalCalculations;
}

export interface FinancialFoundationSummary {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number; // percentage (0 - 100)
  walletBalance: number;
  totalGoalTarget: number;
  totalGoalSaved: number;
  overallGoalProgress: number;
}
