export interface AccountabilityPartner {
  id: number;
  userId: number;
  name: string;
  email: string;
  relationship: string;
  status: 'pending' | 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export type CommitmentLevel = 'low' | 'medium' | 'high' | 'strict';

export interface CommitmentRule {
  id: number;
  userId: number;
  category: string;
  level: CommitmentLevel;
  requiresApproval: boolean;
  maxInstantAmount: number;
  partnerId?: number | null | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export type WithdrawalStatus = 'pending' | 'approved' | 'declined' | 'cancelled' | 'executed';

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
  decisionDate?: Date | null | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationType =
  | 'emergency_withdrawal'
  | 'withdrawal_review_request'
  | 'withdrawal_decision'
  | 'rule_updated';

export interface PartnerNotification {
  id: number;
  userId: number;
  partnerId?: number | null | undefined;
  partnerEmail: string;
  type: NotificationType;
  title: string;
  message: string;
  details?: Record<string, any> | undefined;
  read: boolean;
  createdAt: Date;
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
