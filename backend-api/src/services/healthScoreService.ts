import { DatabaseService } from './databaseService';
import { cache } from '../config/cache';

interface FinancialData {
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  emergencyFundMonths: number;
  debtToIncomeRatio: number;
  incomeStability: number; // 0-1 scale
  investmentDiversification: number; // 0-1 scale
}

interface HealthScoreResult {
  totalScore: number;
  categoryScores: {
    incomeStability: number;
    expenseManagement: number;
    savingsDiscipline: number;
    emergencyPreparedness: number;
    debtManagement: number;
    investmentStrategy: number;
  };
  grade: string;
  insights: string[];
  recommendations: string[];
}

export const calculateHealthScore = async (userId: number): Promise<HealthScoreResult> => {
  const cacheKey = `health_score_${userId}`;

  // Check cache first
  const cachedResult = await cache.get(cacheKey) as HealthScoreResult | null;
  if (cachedResult) {
    return cachedResult;
  }

  // Fetch real user data from database
  const userData = await DatabaseService.getUserFinancialData(userId);

  if (!userData) {
    // Fallback to mock data if no user data found
    const mockData: FinancialData = {
      monthlyIncome: 75000,
      monthlyExpenses: 45000,
      savingsRate: 0.25,
      emergencyFundMonths: 8,
      debtToIncomeRatio: 0.3,
      incomeStability: 0.85,
      investmentDiversification: 0.7
    };
    const result = calculateScoreFromData(mockData);
    await cache.set(cacheKey, result, 300); // Cache for 5 minutes
    return result;
  }

  // Map database data to FinancialData interface
  const financialData: FinancialData = {
    monthlyIncome: userData.monthlyIncome,
    monthlyExpenses: userData.monthlyExpenses,
    savingsRate: userData.monthlyIncome > 0 ? (userData.monthlyIncome - userData.monthlyExpenses) / userData.monthlyIncome : 0,
    emergencyFundMonths: userData.monthlyExpenses > 0 ? userData.emergencyFund / userData.monthlyExpenses : 0,
    debtToIncomeRatio: userData.monthlyIncome > 0 ? userData.debtAmount / userData.monthlyIncome : 0,
    incomeStability: userData.jobStability / 10, // Assuming jobStability is 0-10 scale
    investmentDiversification: userData.riskTolerance === 'high' ? 0.8 : userData.riskTolerance === 'medium' ? 0.6 : 0.4
  };

  const result = calculateScoreFromData(financialData);
  await cache.set(cacheKey, result, 300); // Cache for 5 minutes
  return result;
};

export const calculateScoreFromData = (data: FinancialData): HealthScoreResult => {
  // Calculate individual category scores (0-100)

  // 1. Income Stability (25% weight)
  const incomeStabilityScore = Math.min(100, data.incomeStability * 100);

  // 2. Expense Management (20% weight) - Lower expense ratio is better
  const expenseRatio = data.monthlyExpenses / data.monthlyIncome;
  const expenseManagementScore = Math.max(0, 100 - (expenseRatio * 100));

  // 3. Savings Discipline (20% weight)
  const savingsDisciplineScore = Math.min(100, data.savingsRate * 400); // 25% savings = 100 score

  // 4. Emergency Preparedness (15% weight)
  const emergencyPreparednessScore = Math.min(100, (data.emergencyFundMonths / 12) * 100);

  // 5. Debt Management (10% weight) - Lower DTI is better
  const debtManagementScore = Math.max(0, 100 - (data.debtToIncomeRatio * 200));

  // 6. Investment Strategy (10% weight)
  const investmentStrategyScore = data.investmentDiversification * 100;

  // Calculate weighted total score
  const totalScore = Math.round(
    (incomeStabilityScore * 0.25) +
    (expenseManagementScore * 0.20) +
    (savingsDisciplineScore * 0.20) +
    (emergencyPreparednessScore * 0.15) +
    (debtManagementScore * 0.10) +
    (investmentStrategyScore * 0.10)
  );

  // Determine grade
  const grade = getGradeFromScore(totalScore);

  // Generate insights and recommendations
  const { insights, recommendations } = generateInsightsAndRecommendations(data, {
    incomeStabilityScore,
    expenseManagementScore,
    savingsDisciplineScore,
    emergencyPreparednessScore,
    debtManagementScore,
    investmentStrategyScore
  });

  return {
    totalScore,
    categoryScores: {
      incomeStability: Math.round(incomeStabilityScore),
      expenseManagement: Math.round(expenseManagementScore),
      savingsDiscipline: Math.round(savingsDisciplineScore),
      emergencyPreparedness: Math.round(emergencyPreparednessScore),
      debtManagement: Math.round(debtManagementScore),
      investmentStrategy: Math.round(investmentStrategyScore)
    },
    grade,
    insights,
    recommendations
  };
};

const getGradeFromScore = (score: number): string => {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C+';
  if (score >= 40) return 'C';
  if (score >= 30) return 'D';
  return 'F';
};

const generateInsightsAndRecommendations = (
  data: FinancialData,
  scores: Record<string, number>
): { insights: string[]; recommendations: string[] } => {
  const insights: string[] = [];
  const recommendations: string[] = [];

  // Income Stability Insights
  if (scores.incomeStability < 70) {
    insights.push('Your income shows some variability that could impact financial stability');
    recommendations.push('Consider building multiple income streams or emergency savings to buffer income fluctuations');
  } else {
    insights.push('Your income stability provides a solid foundation for financial planning');
  }

  // Expense Management Insights
  const expenseRatio = data.monthlyExpenses / data.monthlyIncome;
  if (expenseRatio > 0.7) {
    insights.push('Your expense ratio is high, leaving limited room for savings and investments');
    recommendations.push('Aim to reduce monthly expenses to below 70% of income for better financial health');
  } else if (expenseRatio < 0.5) {
    insights.push('Excellent expense management with significant surplus for savings and investments');
  }

  // Savings Insights
  if (data.savingsRate < 0.2) {
    insights.push('Your savings rate needs improvement to build financial security');
    recommendations.push('Target saving at least 20% of your income monthly');
  } else {
    insights.push(`Strong savings discipline with ${Math.round(data.savingsRate * 100)}% savings rate`);
  }

  // Emergency Fund Insights
  if (data.emergencyFundMonths < 6) {
    insights.push('Emergency fund coverage is below recommended 6 months');
    recommendations.push('Build emergency fund to cover 6-12 months of expenses');
  } else {
    insights.push(`Well-prepared with ${data.emergencyFundMonths} months of emergency coverage`);
  }

  // Debt Insights
  if (data.debtToIncomeRatio > 0.4) {
    insights.push('Debt-to-income ratio is high and may impact financial flexibility');
    recommendations.push('Focus on debt reduction strategies and consider debt consolidation');
  } else {
    insights.push('Debt levels are well-managed relative to income');
  }

  // Investment Insights
  if (scores.investmentStrategy < 60) {
    insights.push('Investment portfolio could benefit from better diversification');
    recommendations.push('Consider diversifying investments across different asset classes and risk levels');
  } else {
    insights.push('Investment strategy shows good diversification and risk management');
  }

  return { insights, recommendations };
};

export const getHealthInsights = async (userId: number) => {
  const result = await calculateHealthScore(userId);
  return {
    insights: result.insights,
    recommendations: result.recommendations,
    grade: result.grade,
    score: result.totalScore
  };
};