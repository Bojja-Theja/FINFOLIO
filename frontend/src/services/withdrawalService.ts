import { apiClient } from './apiClient';
import { WalletTransaction } from './walletService';

export type WithdrawalStatus = 'pending' | 'approved' | 'declined' | 'cancelled' | 'executed';

export interface RunwayScenario {
  name: string;
  monthlyExpenses: number;
  months: number;
  description: string;
}

export interface PreTransactionImpact {
  amount: number;
  category: string;
  currentBalance: number;
  remainingBalance: number;
  hasSufficientBalance: boolean;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  estimatedDelayDays: number;
  estimatedDelayMonths: number;
  delayReliable: boolean;
  delayExplanation: string;
  runwayBeforeMonths: number;
  runwayAfterMonths: number;
  runwayImpactMonths: number;
  runwayScenarios: RunwayScenario[];
  savingsRateBefore: number;
  savingsRateAfter: number;
  savingsRateChange: number;
  requiresApproval: boolean;
  tier: 'essential' | 'important' | 'discretionary';
  ruleReason: string;
  assignedPartnerId?: number | undefined;
  assignedPartnerName?: string | undefined;
  assignedPartnerRelationship?: string | undefined;
  goalId?: number | undefined;
  affectedGoalName?: string | undefined;
  affectedGoalProgressBefore?: number | undefined;
  affectedGoalProgressAfter?: number | undefined;
}

export interface WithdrawalRequest {
  id: number;
  userId: number;
  walletId: number;
  goalId?: number | null | undefined;
  amount: number;
  category: string;
  reason: string;
  status: WithdrawalStatus;
  estimatedDelayDays: number;
  runwayImpactMonths: number;
  isEmergency: boolean;
  isOverride: boolean;
  partnerNotes?: string | null | undefined;
  decisionDate?: string | null | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyAnomalyResult {
  anomalyDetected: boolean;
  warnings: string[];
  recentEmergencyCount7d: number;
  recentEmergencyCount30d: number;
  totalEmergencyCount: number;
  balanceDepletionPercent: number;
  remainingRunwayMonths: number;
}

export interface PartnerNotification {
  id: number;
  userId: number;
  partnerId?: number | null | undefined;
  partnerEmail: string;
  type: string;
  title: string;
  message: string;
  details?: Record<string, any> | undefined;
  read: boolean;
  createdAt: string;
}

export interface WithdrawalResponse {
  success: boolean;
  executed: boolean;
  message: string;
  request: WithdrawalRequest;
  impact: PreTransactionImpact;
  transaction?: WalletTransaction | undefined;
  anomaly?: EmergencyAnomalyResult | undefined;
}

export const withdrawalService = {
  async analyzeImpact(
    amount: number,
    category: string,
    goalId?: number | undefined
  ): Promise<PreTransactionImpact> {
    const response = await apiClient.post('/api/withdrawals/analyze', {
      amount,
      category,
      goalId,
    });
    return response.data.impact;
  },

  async requestWithdrawal(data: {
    amount: number;
    category: string;
    reason: string;
    goalId?: number | undefined;
    isEmergency?: boolean | undefined;
    isOverride?: boolean | undefined;
  }): Promise<WithdrawalResponse> {
    const response = await apiClient.post('/api/withdrawals/request', data);
    return response.data;
  },

  async executeEmergency(data: {
    amount: number;
    reason: string;
    category?: string | undefined;
    goalId?: number | undefined;
  }): Promise<WithdrawalResponse> {
    const response = await apiClient.post('/api/withdrawals/emergency', data);
    return response.data;
  },

  async executeOverride(data: {
    amount: number;
    category: string;
    reason: string;
    acknowledgement: string;
    goalId?: number | undefined;
  }): Promise<WithdrawalResponse> {
    const response = await apiClient.post('/api/withdrawals/override', data);
    return response.data;
  },

  async getEmergencyPatterns(): Promise<EmergencyAnomalyResult> {
    const response = await apiClient.get('/api/withdrawals/patterns');
    return response.data.patterns;
  },

  async getWithdrawals(): Promise<WithdrawalRequest[]> {
    const response = await apiClient.get('/api/withdrawals');
    return response.data.withdrawals || [];
  },

  async getWithdrawalById(id: number): Promise<WithdrawalRequest> {
    const response = await apiClient.get(`/api/withdrawals/${id}`);
    return response.data.withdrawal;
  },

  async executeApproved(
    id: number
  ): Promise<{ success: boolean; message: string; request: WithdrawalRequest; transaction: WalletTransaction }> {
    const response = await apiClient.post(`/api/withdrawals/${id}/execute`);
    return response.data;
  },

  async cancelRequest(
    id: number
  ): Promise<{ success: boolean; message: string; request: WithdrawalRequest }> {
    const response = await apiClient.post(`/api/withdrawals/${id}/cancel`);
    return response.data;
  },

  async getNotifications(partnerEmail?: string): Promise<PartnerNotification[]> {
    const response = await apiClient.get('/api/accountability/notifications', {
      params: partnerEmail ? { partnerEmail } : {},
    });
    return response.data.notifications || [];
  },

  async markNotificationRead(id: number): Promise<boolean> {
    const response = await apiClient.post(`/api/accountability/notifications/${id}/read`);
    return response.data.success;
  },
};

