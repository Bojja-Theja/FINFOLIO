import { Request, Response } from 'express';
import { DatabaseService } from '../services/databaseService';
import {
  buildActionPlan,
  buildCashReservePlan,
  buildDebtPayoffPlan,
  buildEmergencyFundPlan,
  buildExpenseStressTest,
  buildFinancialSnapshot,
  buildIncomeStabilitySummary,
  buildRiskProfileSummary,
  buildSavingsGoalPlan,
  calculateBudgetHealth,
  type FinancePlanningInput,
} from '../services/financialPlanningService';

const demoProfile: FinancePlanningInput = {
  monthlyIncome: 52000,
  monthlyExpenses: 31000,
  existingEmi: 7000,
  currentSavings: 186000,
  emergencyFund: 186000,
  debtBalance: 50000,
  savingsGoal: 500000,
  targetMonths: 12,
  creditScore: 710,
  employmentYears: 5,
  jobStability: 7,
  monthlyContribution: 10000,
  incomeVolatility: 0.15,
  expenseGrowthRate: 0.12,
};

async function resolvePlanningInput(req: Request): Promise<FinancePlanningInput> {
  const userId = (req as any).userId;
  const body = (req.body || {}) as Partial<FinancePlanningInput>;

  if (userId) {
    const userData = await DatabaseService.getUserFinancialData(userId);
    if (userData) {
      return {
        ...demoProfile,
        ...body,
        monthlyIncome: body.monthlyIncome ?? userData.monthlyIncome,
        monthlyExpenses: body.monthlyExpenses ?? userData.monthlyExpenses,
        emergencyFund: body.emergencyFund ?? userData.emergencyFund,
        currentSavings: body.currentSavings ?? userData.emergencyFund,
        debtBalance: body.debtBalance ?? userData.debtAmount,
        employmentYears: body.employmentYears ?? Math.max(1, userData.age - 18),
        jobStability: body.jobStability ?? userData.jobStability,
        creditScore: body.creditScore ?? (userData.riskTolerance === 'high' ? 760 : userData.riskTolerance === 'medium' ? 700 : 650),
      };
    }
  }

  return {
    ...demoProfile,
    ...body,
  };
}

export const getBudgetHealth = async (req: Request, res: Response) => {
  const input = await resolvePlanningInput(req);
  res.json(calculateBudgetHealth(input));
};

export const getEmergencyFundPlan = async (req: Request, res: Response) => {
  const input = await resolvePlanningInput(req);
  res.json(buildEmergencyFundPlan(input));
};

export const getDebtPayoffPlan = async (req: Request, res: Response) => {
  const input = await resolvePlanningInput(req);
  res.json(buildDebtPayoffPlan(input));
};

export const getSavingsGoalPlan = async (req: Request, res: Response) => {
  const input = await resolvePlanningInput(req);
  res.json(buildSavingsGoalPlan(input));
};

export const getExpenseStressTest = async (req: Request, res: Response) => {
  const input = await resolvePlanningInput(req);
  res.json(buildExpenseStressTest(input));
};

export const getIncomeStabilitySummary = async (req: Request, res: Response) => {
  const input = await resolvePlanningInput(req);
  res.json(buildIncomeStabilitySummary(input));
};

export const getFinancialSnapshot = async (req: Request, res: Response) => {
  const input = await resolvePlanningInput(req);
  res.json(buildFinancialSnapshot(input));
};

export const getRiskProfileSummary = async (req: Request, res: Response) => {
  const input = await resolvePlanningInput(req);
  res.json(buildRiskProfileSummary(input));
};

export const getCashReservePlan = async (req: Request, res: Response) => {
  const input = await resolvePlanningInput(req);
  res.json(buildCashReservePlan(input));
};

export const getActionPlan = async (req: Request, res: Response) => {
  const input = await resolvePlanningInput(req);
  res.json(buildActionPlan(input));
};
