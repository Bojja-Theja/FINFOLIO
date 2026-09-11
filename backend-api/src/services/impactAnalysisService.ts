import { DatabaseService } from './databaseService';
import { WalletService } from './walletService';
import { FinancialGoalService } from './financialGoalService';
import { AccountabilityService } from './accountabilityService';
import { logger } from '../utils/logger';

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

export class ImpactAnalysisService {
  /**
   * Deterministically calculate pre-transaction financial impact
   */
  static async analyzePreTransactionImpact(
    userId: number,
    amount: number,
    category: string,
    goalId?: number | undefined
  ): Promise<PreTransactionImpact> {
    const parsedAmount = Math.max(0, Math.round(amount * 100) / 100);

    const [wallet, userData, ruleEval, userGoals] = await Promise.all([
      WalletService.getWallet(userId),
      DatabaseService.getUserFinancialData(userId),
      AccountabilityService.evaluateRequirement(userId, parsedAmount, category),
      FinancialGoalService.getGoals(userId),
    ]);

    const currentBalance = wallet.balance;
    const remainingBalance = Math.max(0, Math.round((currentBalance - parsedAmount) * 100) / 100);
    const hasSufficientBalance = currentBalance >= parsedAmount;

    const monthlyIncome = userData?.monthlyIncome ?? 50000;
    const monthlyExpenses = userData?.monthlyExpenses ?? 30000;
    const monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses);

    // Goal Delay Calculation
    let estimatedDelayDays = 0;
    let estimatedDelayMonths = 0;
    let delayReliable = false;
    let delayExplanation = '';

    if (monthlySavings <= 0) {
      delayReliable = false;
      delayExplanation =
        'A reliable goal-delay estimate is unavailable because your current monthly savings rate is zero or negative.';
    } else {
      delayReliable = true;
      estimatedDelayMonths = Math.round((parsedAmount / monthlySavings) * 10) / 10;
      estimatedDelayDays = Math.round((parsedAmount / monthlySavings) * 30);
      delayExplanation = `At your current savings pace of $${monthlySavings.toLocaleString()}/month, this withdrawal may delay your savings goals by approximately ${estimatedDelayDays} days.`;
    }

    // Runway Calculation
    const essentialExpenses = Math.max(1, monthlyExpenses);
    const runwayBeforeMonths = Math.round((currentBalance / essentialExpenses) * 10) / 10;
    const runwayAfterMonths = Math.round((remainingBalance / essentialExpenses) * 10) / 10;
    const runwayImpactMonths = Math.max(
      0,
      Math.round((runwayBeforeMonths - runwayAfterMonths) * 10) / 10
    );

    // Multi-Scenario Runway
    const runwayScenarios: RunwayScenario[] = [
      {
        name: 'Current Spending',
        monthlyExpenses,
        months: runwayAfterMonths,
        description: 'Estimated runway at your current monthly expenditure pace.',
      },
      {
        name: 'Reduced Spending (-20%)',
        monthlyExpenses: Math.round(monthlyExpenses * 0.8),
        months: Math.round((remainingBalance / (essentialExpenses * 0.8)) * 10) / 10,
        description: 'Runway if discretionary living expenses are trimmed by 20%.',
      },
      {
        name: 'Severe Expense (+25%)',
        monthlyExpenses: Math.round(monthlyExpenses * 1.25),
        months: Math.round((remainingBalance / (essentialExpenses * 1.25)) * 10) / 10,
        description: 'Runway under unexpected inflation or emergency cost spikes.',
      },
    ];

    // Savings Rate Change
    const savingsRateBefore =
      monthlyIncome > 0
        ? Math.round(((monthlySavings / monthlyIncome) * 100) * 10) / 10
        : 0;

    const effectiveSavingsAfter = Math.max(0, monthlySavings - parsedAmount);
    const savingsRateAfter =
      monthlyIncome > 0
        ? Math.round(((effectiveSavingsAfter / monthlyIncome) * 100) * 10) / 10
        : 0;

    const savingsRateChange = Math.max(
      0,
      Math.round((savingsRateBefore - savingsRateAfter) * 10) / 10
    );

    // Goal Details (if linked)
    let affectedGoalName: string | undefined = undefined;
    let affectedGoalProgressBefore: number | undefined = undefined;
    let affectedGoalProgressAfter: number | undefined = undefined;

    if (goalId) {
      const targetGoal = userGoals.find(g => g.id === goalId);
      if (targetGoal) {
        affectedGoalName = targetGoal.name;
        affectedGoalProgressBefore = targetGoal.calculations.progressPercent;
        const newGoalSaved = Math.max(0, targetGoal.currentAmount - parsedAmount);
        affectedGoalProgressAfter = FinancialGoalService.calculateGoalProgress(
          newGoalSaved,
          targetGoal.targetAmount
        );
      }
    }

    // Partner Details (if assigned)
    let assignedPartnerName: string | undefined = undefined;
    let assignedPartnerRelationship: string | undefined = undefined;

    if (ruleEval.partnerId) {
      const partner = await DatabaseService.getAccountabilityPartnerById(ruleEval.partnerId);
      if (partner) {
        assignedPartnerName = partner.name;
        assignedPartnerRelationship = partner.relationship;
      }
    }

    logger.info(
      `Pre-transaction impact computed for user ${userId}: amount=$${parsedAmount}, delay=${estimatedDelayDays}d, runwayAfter=${runwayAfterMonths}mo, requiresApproval=${ruleEval.requiresApproval}`
    );

    return {
      amount: parsedAmount,
      category,
      currentBalance,
      remainingBalance,
      hasSufficientBalance,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      estimatedDelayDays,
      estimatedDelayMonths,
      delayReliable,
      delayExplanation,
      runwayBeforeMonths,
      runwayAfterMonths,
      runwayImpactMonths,
      runwayScenarios,
      savingsRateBefore,
      savingsRateAfter,
      savingsRateChange,
      requiresApproval: ruleEval.requiresApproval,
      tier: ruleEval.tier,
      ruleReason: ruleEval.reason,
      assignedPartnerId: ruleEval.partnerId,
      assignedPartnerName,
      assignedPartnerRelationship,
      goalId,
      affectedGoalName,
      affectedGoalProgressBefore,
      affectedGoalProgressAfter,
    };
  }
}
