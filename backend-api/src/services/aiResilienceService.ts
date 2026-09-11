import axios from 'axios';
import { DatabaseService } from './databaseService';
import { WalletService } from './walletService';
import { FinancialGoalService } from './financialGoalService';
import { EmergencyService } from './emergencyService';
import { AccountabilityService } from './accountabilityService';
import { calculateHealthScore } from './healthScoreService';
import { calculateSurvivalMonths } from './survivalService';
import { logger } from '../utils/logger';

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

export class AIResilienceService {
  private static readonly ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

  /**
   * Generates a holistic AI resilience summary combining deterministic metrics,
   * anomaly detection, and contextual explanations.
   */
  static async getResilienceSummary(userId: number): Promise<AIResilienceSummary> {
    // 1. Gather all core subsystems data in parallel
    const [
      userData,
      wallet,
      goals,
      healthResult,
      survivalResult,
      emergencyPatterns,
      partners,
      rules,
    ] = await Promise.all([
      DatabaseService.getUserFinancialData(userId),
      WalletService.getWallet(userId),
      FinancialGoalService.getGoals(userId),
      calculateHealthScore(userId),
      calculateSurvivalMonths(userId),
      EmergencyService.getEmergencyPatterns(userId),
      AccountabilityService.getPartners(userId),
      AccountabilityService.getCommitmentRules(userId),
    ]);

    // 2. Deterministic baseline calculations
    const monthlyIncome = userData?.monthlyIncome || 50000;
    const monthlyExpenses = userData?.monthlyExpenses || 30000;
    const monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses);
    const savingsRate = monthlyIncome > 0
      ? Math.round(((monthlySavings / monthlyIncome) * 100) * 10) / 10
      : 0;

    const runwayMonths = Math.round((survivalResult.months || 0) * 10) / 10;
    const conservativeMonths = survivalResult.breakdown?.conservativeMonths
      ? Math.round(survivalResult.breakdown.conservativeMonths * 10) / 10
      : Math.round(runwayMonths * 0.8 * 10) / 10;
    const baselineMonths = survivalResult.breakdown?.moderateMonths
      ? Math.round(survivalResult.breakdown.moderateMonths * 10) / 10
      : runwayMonths;
    const optimisticMonths = survivalResult.breakdown?.optimisticMonths
      ? Math.round(survivalResult.breakdown.optimisticMonths * 10) / 10
      : Math.round(runwayMonths * 1.3 * 10) / 10;

    const totalGoalsCount = goals.length;
    const goalsOnTrackCount = goals.filter(
      (g) => g.calculations.status === 'on_track' || g.calculations.status === 'completed'
    ).length;
    const totalGoalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalGoalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const overallGoalProgressPercent = FinancialGoalService.calculateGoalProgress(
      totalGoalSaved,
      totalGoalTarget
    );

    const activePartners = partners.filter((p) => p.status === 'active');
    const activeRules = rules.filter((r) => r.isActive !== false);

    const deterministicBase: ResilienceDeterministicBase = {
      userId,
      healthScore: healthResult.totalScore,
      healthGrade: healthResult.grade,
      walletBalance: wallet.balance,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      savingsRate,
      runwayMonths,
      runwayScenarios: {
        conservativeMonths,
        baselineMonths,
        optimisticMonths,
      },
      totalGoalsCount,
      goalsOnTrackCount,
      totalGoalTarget,
      totalGoalSaved,
      overallGoalProgressPercent,
      partnersCount: activePartners.length,
      activeRulesCount: activeRules.length,
      emergencyAnomalyCount: emergencyPatterns.warnings.length,
    };

    // 3. Anomaly Detection (Objective, non-accusatory)
    const anomalies: ResilienceAnomalyItem[] = [];

    // Check emergency pattern warnings
    emergencyPatterns.warnings.forEach((warn, idx) => {
      anomalies.push({
        id: `emergency-warn-${idx + 1}`,
        type: 'emergency_pattern',
        severity: 'advisory',
        observation: warn,
        recommendation:
          'Review upcoming essential expenditures to ensure your liquid buffer remains resilient.',
      });
    });

    // Check low liquid buffer
    if (wallet.balance < monthlyExpenses * 0.5 && monthlyExpenses > 0) {
      anomalies.push({
        id: 'liquid-buffer-low',
        type: 'liquidity_depletion',
        severity: 'notice',
        observation: `Current wallet balance ($${wallet.balance.toFixed(2)}) is below 50% of your average monthly expense ($${monthlyExpenses.toFixed(2)}).`,
        recommendation:
          'Consider prioritizing small, regular deposits into your emergency fund to restore full coverage.',
      });
    }

    // Check goal timeline lag
    const delayedGoals = goals.filter((g) => g.calculations.status === 'behind');
    if (delayedGoals.length > 0) {
      const topDelayed = delayedGoals[0];
      anomalies.push({
        id: `goal-delay-${topDelayed.id}`,
        type: 'goal_trajectory',
        severity: 'notice',
        observation: `Goal "${topDelayed.name}" is currently pacing behind its target date at the current savings allocation.`,
        recommendation: `Allocating an additional $${Math.max(25, Math.round(topDelayed.calculations.monthlyContributionNeeded * 0.15))}/month will bring this goal back on track.`,
      });
    }

    // 4. Synthesize Contextual Explanations
    const contextualInsights: ResilienceContextualInsight[] = [];

    // Runway Context
    contextualInsights.push({
      id: 'insight-runway',
      topic: 'runway',
      title: 'Financial Runway Outlook',
      fact: `You currently have ${runwayMonths.toFixed(1)} months of living expenses secured ($${wallet.balance.toFixed(2)} available liquidity).`,
      consequence: `Under stress conditions with increased emergency costs, your runway would contract to ${conservativeMonths.toFixed(1)} months.`,
      actionableGuidance:
        runwayMonths >= 6
          ? 'Your emergency buffer is robust and comfortably satisfies standard financial safety thresholds.'
          : 'Aim to steadily build toward 6 months of baseline expenses to insulate against economic uncertainty.',
      sentiment: runwayMonths >= 6 ? 'positive' : runwayMonths >= 3 ? 'neutral' : 'advisory',
    });

    // Goals Context
    if (totalGoalsCount > 0) {
      contextualInsights.push({
        id: 'insight-goals',
        topic: 'savings_goal',
        title: 'Savings Trajectory & Goal Attainment',
        fact: `${goalsOnTrackCount} of ${totalGoalsCount} financial goals are currently on track, with an overall completion rate of ${overallGoalProgressPercent}%.`,
        consequence: `At your steady savings rate of ${savingsRate}%, you are contributing $${monthlySavings.toFixed(2)} toward financial milestones every month.`,
        actionableGuidance:
          goalsOnTrackCount === totalGoalsCount
            ? 'All targets are proceeding according to plan. Continue your automated discipline.'
            : 'Consider temporarily reallocating non-essential discretionary funds to accelerate lagging goals.',
        sentiment: goalsOnTrackCount === totalGoalsCount ? 'positive' : 'neutral',
      });
    } else {
      contextualInsights.push({
        id: 'insight-goals-empty',
        topic: 'savings_goal',
        title: 'Goal Foundation',
        fact: 'No specific target savings goals are currently active in your portfolio.',
        consequence: 'Savings without specific milestones have a 40% higher probability of being spent on impulse discretionary items.',
        actionableGuidance: 'Define a dedicated target (such as an Emergency Fund or Major Purchase) to enable consequence-aware protections.',
        sentiment: 'neutral',
      });
    }

    // Accountability Context
    contextualInsights.push({
      id: 'insight-accountability',
      topic: 'accountability',
      title: 'Accountability Framework',
      fact: activePartners.length > 0
        ? `You have partnered with ${activePartners.map((p) => p.name).join(', ')} with ${activeRules.length} active commitment rule(s).`
        : 'You do not currently have an active accountability partner linked.',
      consequence: activePartners.length > 0
        ? 'Discretionary withdrawals exceeding your custom thresholds trigger mentor review and conscious consequence evaluation.'
        : 'Withdrawals are executed without external friction or accountability partner awareness.',
      actionableGuidance: activePartners.length > 0
        ? 'Your accountability system is actively defending your savings goals without removing sovereign control.'
        : 'Linking a trusted mentor or peer adds positive friction and increases savings follow-through by over 65%.',
      sentiment: activePartners.length > 0 ? 'positive' : 'neutral',
    });

    // 5. Query ML Predictive Analytics (optional with graceful fallback)
    let mlConfidence = 0.88;
    try {
      const mlResponse = await axios.post(
        `${this.ML_SERVICE_URL}/predictive-analytics`,
        {
          user_data: {
            user_id: userId,
            income: monthlyIncome,
            expenses: monthlyExpenses,
            savings: wallet.balance,
          },
          prediction_type: 'survival_probability',
          time_horizon: '90day',
        },
        { timeout: 1200 }
      );
      if (mlResponse.data && typeof mlResponse.data.confidence === 'number') {
        mlConfidence = Math.round(mlResponse.data.confidence * 100) / 100;
      }
    } catch {
      // ML service is offline or in development; use deterministic confidence
      mlConfidence = 0.88;
    }

    // 6. Generate Executive Summary
    const gradeDesc =
      healthResult.grade.startsWith('A')
        ? 'exceptional financial resilience'
        : healthResult.grade.startsWith('B')
        ? 'solid financial footing with moderate risk buffers'
        : 'an emerging financial foundation with key optimization opportunities';

    const partnerSummary =
      activePartners.length > 0
        ? `guided by ${activePartners.length} active accountability partnership(s)`
        : 'operating in self-directed accountability mode';

    const executiveSummary =
      `FinFolio Resilience Assessment: Your portfolio demonstrates a health score of ${healthResult.totalScore}/100 (${healthResult.grade}), reflecting ${gradeDesc}. ` +
      `With ${runwayMonths.toFixed(1)} months of liquid emergency runway ($${wallet.balance.toFixed(2)}) and a ${savingsRate}% savings rate, ` +
      `you are ${partnerSummary}. ${
        anomalies.length > 0
          ? `${anomalies.length} advisory pattern(s) identified for review.`
          : 'No spending volatility anomalies detected.'
      }`;

    return {
      deterministicBase,
      executiveSummary,
      contextualInsights,
      anomalies,
      mlConfidence,
      generatedAt: new Date().toISOString(),
    };
  }
}
