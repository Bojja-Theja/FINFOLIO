import { apiClient } from './apiClient';

export type PartnerStatus = 'pending' | 'active' | 'inactive';
export type CommitmentLevel = 'low' | 'medium' | 'high' | 'strict';
export type WithdrawalStatus = 'pending' | 'approved' | 'declined' | 'cancelled' | 'executed';

export interface AccountabilityPartner {
  id: number;
  userId: number;
  name: string;
  email: string;
  relationship: string;
  status: PartnerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CommitmentRule {
  id: number;
  userId: number;
  category: string;
  level: CommitmentLevel;
  requiresApproval: boolean;
  maxInstantAmount: number;
  partnerId?: number | null | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface RuleEvaluationResult {
  requiresApproval: boolean;
  tier: 'essential' | 'important' | 'discretionary';
  rule: CommitmentRule | null;
  partnerId?: number | undefined;
  reason: string;
  maxInstantAmount: number;
}

export interface PartnerViewRequest {
  id: number;
  userId: number;
  amount: number;
  category: string;
  reason: string;
  status: WithdrawalStatus;
  estimatedDelayDays: number;
  runwayImpactMonths: number;
  isEmergency: boolean;
  isOverride: boolean;
  partnerNotes?: string | undefined;
  decisionDate?: string | undefined;
  createdAt: string;
}

export const accountabilityService = {
  async getPartners(): Promise<AccountabilityPartner[]> {
    const response = await apiClient.get('/api/accountability/partners');
    return response.data.partners || [];
  },

  async invitePartner(
    name: string,
    email: string,
    relationship: string = 'mentor'
  ): Promise<{ success: boolean; message: string; partner: AccountabilityPartner }> {
    const response = await apiClient.post('/api/accountability/partners/invite', {
      name,
      email,
      relationship,
    });
    return response.data;
  },

  async acceptInvitation(
    partnerId: number,
    email: string
  ): Promise<{ success: boolean; message: string; partner: AccountabilityPartner }> {
    const response = await apiClient.post(`/api/accountability/partners/${partnerId}/accept`, {
      email,
    });
    return response.data;
  },

  async revokePartner(partnerId: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`/api/accountability/partners/${partnerId}/revoke`);
    return response.data;
  },

  async getRules(): Promise<CommitmentRule[]> {
    const response = await apiClient.get('/api/accountability/rules');
    return response.data.rules || [];
  },

  async setRule(ruleData: {
    id?: number | undefined;
    category: string;
    level: CommitmentLevel;
    requiresApproval: boolean;
    maxInstantAmount: number;
    partnerId?: number | null | undefined;
  }): Promise<{ success: boolean; message: string; rule: CommitmentRule }> {
    const response = await apiClient.post('/api/accountability/rules', ruleData);
    return response.data;
  },

  async deleteRule(ruleId: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/accountability/rules/${ruleId}`);
    return response.data;
  },

  async evaluateRequirement(amount: number, category: string): Promise<RuleEvaluationResult> {
    const response = await apiClient.post('/api/accountability/rules/evaluate', {
      amount,
      category,
    });
    return response.data.evaluation;
  },

  async getPartnerInbox(partnerEmail: string): Promise<PartnerViewRequest[]> {
    const response = await apiClient.get('/api/accountability/partner/requests', {
      params: { email: partnerEmail },
    });
    return response.data.requests || [];
  },

  async recordPartnerDecision(
    requestId: number,
    decision: 'approved' | 'declined',
    notes: string,
    partnerEmail: string
  ): Promise<{ success: boolean; message: string; request: PartnerViewRequest }> {
    const response = await apiClient.post(
      `/api/accountability/partner/requests/${requestId}/decision`,
      {
        decision,
        notes,
        partnerEmail,
      }
    );
    return response.data;
  },
};
