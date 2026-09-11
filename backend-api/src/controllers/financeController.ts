import { Request, Response } from 'express';
import { calculateHealthScore } from '../services/healthScoreService.js';
import { calculateSurvivalMonths } from '../services/survivalService.js';
import { calculateIncomeSuitabilityScore } from '../services/incomeVarianceService.js';
import { monteCarloProjection } from '../services/whatIfService.js';
import { getDebtSnowballRecommendation } from '../services/aiCoachService.js';
import { buildLoanRecommendation, type LoanType } from '../services/loanRecommendationService.js';
import { AIResilienceService } from '../services/aiResilienceService.js';
import { logger } from '../utils/logger.js';

export const calculateFinance = async (req: Request, res: Response) => {
  // TODO: General finance calculations
  const { income, expenses } = req.body;
  const ratio = expenses / income;
  res.json({ expenseRatio: ratio });
};

export const getHealthScore = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const isGuest = (req as any).isGuest;

  const startTime = Date.now();
  // For guest users or when no user data is available, use mock data
  const result = await calculateHealthScore(userId || 0);
  const duration = Date.now() - startTime;
  logger.info(`Health score calculation for user ${userId} took ${duration}ms`);

  res.json({
    score: result.totalScore,
    grade: result.grade,
    categoryScores: result.categoryScores,
    insights: result.insights,
    recommendations: result.recommendations,
    isGuest: isGuest || false
  });
};

export const getSurvival = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const isGuest = (req as any).isGuest;

  const startTime = Date.now();
  const result = await calculateSurvivalMonths(userId || 0);
  const duration = Date.now() - startTime;
  logger.info(`Survival calculation for user ${userId} took ${duration}ms`);

  res.json({
    months: result.months,
    riskLevel: result.riskLevel,
    breakdown: result.breakdown,
    scenarios: result.scenarios,
    recommendations: result.recommendations,
    isGuest: isGuest || false
  });
};

export const getIncomeScore = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const isGuest = (req as any).isGuest;

  const startTime = Date.now();
  const result = await calculateIncomeSuitabilityScore(userId || 0);
  const duration = Date.now() - startTime;
  logger.info(`Income score calculation for user ${userId} took ${duration}ms`);

  res.json({
    score: result.totalScore,
    grade: result.grade,
    riskLevel: result.riskLevel,
    categoryScores: result.categoryScores,
    insights: result.insights,
    recommendations: result.recommendations,
    projections: result.projections,
    isGuest: isGuest || false
  });
};

export const getWhatIfProjection = async (req: Request, res: Response): Promise<void> => {
  const userId = 1; // Use demo user ID 1 for all requests
  const { jobLoss, raise, expenseChange } = req.body;

  const startTime = Date.now();
  const result = await monteCarloProjection(userId, jobLoss, raise, expenseChange);
  const duration = Date.now() - startTime;
  logger.info(`What-if projection for user ${userId} took ${duration}ms`);

  if (!result) {
    // Fallback response for demo
    const demoResult = {
      projection: [
        { year: 1, netWorth: 200000, upperBound: 220000, lowerBound: 180000 },
        { year: 2, netWorth: 230000, upperBound: 260000, lowerBound: 200000 },
        { year: 3, netWorth: 265000, upperBound: 310000, lowerBound: 220000 },
        { year: 4, netWorth: 305000, upperBound: 370000, lowerBound: 240000 },
        { year: 5, netWorth: 350000, upperBound: 440000, lowerBound: 260000 },
        { year: 6, netWorth: 400000, upperBound: 520000, lowerBound: 280000 },
        { year: 7, netWorth: 460000, upperBound: 610000, lowerBound: 310000 },
        { year: 8, netWorth: 525000, upperBound: 720000, lowerBound: 330000 },
        { year: 9, netWorth: 600000, upperBound: 850000, lowerBound: 350000 },
        { year: 10, netWorth: 685000, upperBound: 1000000, lowerBound: 370000 }
      ]
    };
    res.json(demoResult);
    return;
  }

  res.json(result);
};

export const getResilienceSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const summary = await AIResilienceService.getResilienceSummary(userId);
    res.json(summary);
  } catch (error: any) {
    logger.error('Failed to get resilience summary:', error);
    res.status(500).json({ error: error.message || 'Failed to generate resilience summary' });
  }
};

export const getAISummary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const resilience = await AIResilienceService.getResilienceSummary(userId);
    res.json({
      summary: resilience.executiveSummary,
      insights: resilience.contextualInsights,
      anomalies: resilience.anomalies,
      deterministicBase: resilience.deterministicBase,
      confidence: resilience.mlConfidence,
    });
  } catch (error: any) {
    logger.error('Failed to generate AI summary:', error);
    res.status(500).json({ error: error.message || 'Failed to generate AI summary' });
  }
};

export const getBenchmark = async (req: Request, res: Response) => {
  // Mock benchmark data shaped for UI benchmark card
  const benchmark = {
    percentile: 75,
    incomeBracket: '$50K-$75K',
    ageGroup: '25-34',
    averageScore: 72.4,
    userScore: 78.1,
    trend: 'up' as const,
  };

  res.json(benchmark);
};

export const getCashFlow = async (req: Request, res: Response) => {
  // Mock cash flow data for Sankey
  const data = {
    nodes: [
      { name: 'Income' },
      { name: 'Essentials' },
      { name: 'Debt' },
      { name: 'Savings' }
    ],
    links: [
      { source: 0, target: 1, value: 30000 },
      { source: 1, target: 2, value: 10000 },
      { source: 1, target: 3, value: 20000 }
    ]
  };
  res.json(data);
};

export const getDebtRecommendation = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const recommendation = await getDebtSnowballRecommendation(userId || 0);
  res.json(recommendation);
};

export const getLoanRecommendation = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;

  const {
    annualIncome,
    monthlyExpenses,
    existingEmi,
    desiredLoanAmount,
    tenureMonths,
    creditScore,
    employmentYears,
    loanType,
  } = req.body || {};

  if (!annualIncome || !monthlyExpenses || !desiredLoanAmount || !tenureMonths || !creditScore || !employmentYears || !loanType) {
    res.status(400).json({
      error: 'Missing required fields',
      required: ['annualIncome', 'monthlyExpenses', 'desiredLoanAmount', 'tenureMonths', 'creditScore', 'employmentYears', 'loanType'],
    });
    return;
  }

  const allowedTypes: LoanType[] = ['personal_loan', 'home_loan', 'car_loan', 'education_loan', 'business_loan'];
  if (!allowedTypes.includes(loanType)) {
    res.status(400).json({
      error: 'Invalid loanType',
      allowed: allowedTypes,
    });
    return;
  }

  const recommendation = await buildLoanRecommendation({
    userId,
    annualIncome: Number(annualIncome),
    monthlyExpenses: Number(monthlyExpenses),
    existingEmi: existingEmi !== undefined ? Number(existingEmi) : undefined,
    desiredLoanAmount: Number(desiredLoanAmount),
    tenureMonths: Number(tenureMonths),
    creditScore: Number(creditScore),
    employmentYears: Number(employmentYears),
    loanType,
  });

  res.json(recommendation);
};