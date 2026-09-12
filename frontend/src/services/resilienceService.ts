import { apiClient } from './apiClient';

export interface ResilienceDeterministicBase {
  userId: number;
  healthScore: number;
  healthGrade: string;
  walletBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number;
  runwayMonths: number;
  runwayScenarios: {
    conservativeMonths: number;
    baselineMonths: number;
    optimisticMonths: number;
  };
  totalGoalsCount: number;
  goalsOnTrackCount: number;
  totalGoalTarget: number;
  totalGoalSaved: number;
  overallGoalProgressPercent: number;
  partnersCount: number;
  activeRulesCount: number;
  emergencyAnomalyCount: number;
}

export interface ResilienceContextualInsight {
  id: string;
  topic: 'health' | 'runway' | 'savings_goal' | 'accountability' | 'emergency';
  title: string;
  fact: string;
  consequence: string;
  actionableGuidance: string;
  sentiment: 'positive' | 'neutral' | 'advisory';
}

export interface ResilienceAnomalyItem {
  id: string;
  type: string;
  severity: 'info' | 'notice' | 'advisory';
  observation: string;
  recommendation: string;
}

export interface AIResilienceSummary {
  deterministicBase: ResilienceDeterministicBase;
  executiveSummary: string;
  contextualInsights: ResilienceContextualInsight[];
  anomalies: ResilienceAnomalyItem[];
  mlConfidence: number;
  generatedAt: string;
}

export const resilienceService = {
  async getResilienceSummary(): Promise<AIResilienceSummary> {
    try {
      const res = await apiClient.get('/finance/resilience-summary');
      return res.data;
    } catch {
      // Graceful fallback to deterministic mock for offline/demo
      return {
        deterministicBase: {
          userId: 1,
          healthScore: 78,
          healthGrade: 'A',
          walletBalance: 2450,
          monthlyIncome: 52000,
          monthlyExpenses: 31000,
          monthlySavings: 21000,
          savingsRate: 40.4,
          runwayMonths: 4.8,
          runwayScenarios: {
            conservativeMonths: 3.8,
            baselineMonths: 4.8,
            optimisticMonths: 6.2,
          },
          totalGoalsCount: 3,
          goalsOnTrackCount: 2,
          totalGoalTarget: 850000,
          totalGoalSaved: 375000,
          overallGoalProgressPercent: 44.1,
          partnersCount: 1,
          activeRulesCount: 3,
          emergencyAnomalyCount: 0,
        },
        executiveSummary:
          'FinFolio Resilience Assessment: Your portfolio demonstrates a health score of 78/100 (A), reflecting solid financial footing. With 4.8 months of liquid emergency runway and a 40.4% savings rate, you are actively defending your milestones.',
        contextualInsights: [
          {
            id: 'insight-runway',
            topic: 'runway',
            title: 'Financial Runway Outlook',
            fact: 'You currently have 4.8 months of essential expenses secured in liquid reserves (₹2,45,000 wallet liquidity).',
            consequence: 'Under stress conditions with sudden expense shocks, your runway adjusts to 3.8 months.',
            actionableGuidance: 'Maintaining steady monthly allocations ensures your emergency buffer remains insulated.',
            sentiment: 'positive',
          },
          {
            id: 'insight-goals',
            topic: 'savings_goal',
            title: 'Savings Trajectory & Goal Attainment',
            fact: '2 of 3 target savings goals are currently on track, with an overall portfolio progress of 44.1%.',
            consequence: 'At your steady savings rate of 40.4%, you are adding ₹21,000 toward financial resilience every month.',
            actionableGuidance: 'Continue automated transfers to preserve projected completion dates.',
            sentiment: 'positive',
          },
          {
            id: 'insight-accountability',
            topic: 'accountability',
            title: 'Accountability Framework',
            fact: 'Accountability rules are active with 3 commitment tiers protecting your financial foundation.',
            consequence: 'Large discretionary withdrawals trigger consequence evaluation and mentor review before execution.',
            actionableGuidance: 'Transparent friction protects your long-term wealth without restricting sovereign control.',
            sentiment: 'positive',
          },
        ],
        anomalies: [],
        mlConfidence: 0.92,
        generatedAt: new Date().toISOString(),
      };
    }
  },
};
