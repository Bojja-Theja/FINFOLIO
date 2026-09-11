import { apiClient } from './apiClient';

export interface GoalCalculations {
  progressPercent: number;
  remainingAmount: number;
  monthsRemaining: number;
  monthlySavingsNeeded: number;
  estimatedCompletionDate: string;
  isOnTrack: boolean;
  status: 'not_started' | 'in_progress' | 'nearly_there' | 'completed';
}

export interface FinancialGoal {
  id: number;
  userId: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string | null;
  category: string;
  priority: 'low' | 'medium' | 'high';
  calculations: GoalCalculations;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialFoundationSummary {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number;
  walletBalance: number;
  totalGoalTarget: number;
  totalGoalSaved: number;
  overallGoalProgress: number;
}

export interface GoalsResponse {
  success: boolean;
  summary: FinancialFoundationSummary;
  goals: FinancialGoal[];
}

export const goalService = {
  async getGoals(): Promise<GoalsResponse> {
    const response = await apiClient.get('/api/goals');
    return response.data;
  },

  async createGoal(data: {
    name: string;
    targetAmount: number;
    currentAmount?: number;
    targetDate?: string | null;
    category?: string;
    priority?: 'low' | 'medium' | 'high';
  }): Promise<{ success: boolean; goal: FinancialGoal }> {
    const response = await apiClient.post('/api/goals', data);
    return response.data;
  },

  async updateGoal(id: number, data: Partial<FinancialGoal>): Promise<{ success: boolean; goal: FinancialGoal }> {
    const response = await apiClient.put(`/api/goals/${id}`, data);
    return response.data;
  },

  async deleteGoal(id: number): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/api/goals/${id}`);
    return response.data;
  },

  async contributeToGoal(id: number, amount: number): Promise<{ success: boolean; goal: FinancialGoal }> {
    const response = await apiClient.post(`/api/goals/${id}/contribute`, { amount });
    return response.data;
  },

  async getFoundationSummary(): Promise<{ success: boolean; summary: FinancialFoundationSummary }> {
    const response = await apiClient.get('/api/goals/summary');
    return response.data;
  }
};
