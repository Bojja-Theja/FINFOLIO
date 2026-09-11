import { DatabaseService } from './databaseService';

interface IncomeData {
  monthlyIncome: number;
  incomeHistory: number[]; // Last 12 months
  incomeSources: Array<{
    type: 'salary' | 'freelance' | 'business' | 'investment' | 'other';
    amount: number;
    frequency: 'monthly' | 'irregular';
    stability: number; // 0-1
  }>;
  growthRate: number; // Year-over-year growth
  location: string;
  industry: string;
  experience: number; // years
}

interface IncomeScoreResult {
  totalScore: number;
  categoryScores: {
    stability: number;
    growth: number;
    diversification: number;
    marketAlignment: number;
    goalSuitability: number;
  };
  grade: string;
  insights: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  projections: {
    nextYear: number;
    fiveYear: number;
    confidence: number;
  };
}

export const calculateIncomeSuitabilityScore = async (userId: number): Promise<IncomeScoreResult> => {
  // Fetch real user data from database
  const userData = await DatabaseService.getUserFinancialData(userId);

  if (!userData) {
    // Fallback to mock data if no user data found
    const mockData: IncomeData = {
      monthlyIncome: 75000,
      incomeHistory: [70000, 72000, 74000, 75000, 76000, 75000, 77000, 78000, 75000, 80000, 82000, 75000],
      incomeSources: [
        { type: 'salary', amount: 65000, frequency: 'monthly', stability: 0.9 },
        { type: 'freelance', amount: 10000, frequency: 'irregular', stability: 0.6 }
      ],
      growthRate: 0.08,
      location: 'metro',
      industry: 'technology',
      experience: 5
    };
    return calculateIncomeScoreFromData(mockData);
  }

  // Map database data to IncomeData (using defaults for missing fields)
  const incomeData: IncomeData = {
    monthlyIncome: userData.monthlyIncome,
    incomeHistory: Array(12).fill(userData.monthlyIncome), // Assume constant income for now
    incomeSources: [
      { type: 'salary', amount: userData.monthlyIncome, frequency: 'monthly', stability: userData.jobStability / 10 }
    ],
    growthRate: 0.05, // Default 5% growth
    location: 'metro', // TODO: Add to user profile
    industry: 'technology', // TODO: Add to user profile
    experience: 5 // TODO: Use from user profile
  };

  return calculateIncomeScoreFromData(incomeData);
};

export const calculateIncomeScoreFromData = (data: IncomeData): IncomeScoreResult => {
  // Calculate individual category scores (0-100)

  // 1. Stability Score (30% weight)
  const stabilityScore = calculateStabilityScore(data);

  // 2. Growth Score (25% weight)
  const growthScore = calculateGrowthScore(data);

  // 3. Diversification Score (20% weight)
  const diversificationScore = calculateDiversificationScore(data);

  // 4. Market Alignment Score (15% weight)
  const marketAlignmentScore = calculateMarketAlignmentScore(data);

  // 5. Goal Suitability Score (10% weight)
  const goalSuitabilityScore = calculateGoalSuitabilityScore(data);

  // Calculate weighted total score
  const totalScore = Math.round(
    (stabilityScore * 0.30) +
    (growthScore * 0.25) +
    (diversificationScore * 0.20) +
    (marketAlignmentScore * 0.15) +
    (goalSuitabilityScore * 0.10)
  );

  // Determine grade and risk level
  const grade = getIncomeGrade(totalScore);
  const riskLevel = getIncomeRiskLevel(totalScore);

  // Generate insights and recommendations
  const { insights, recommendations } = generateIncomeInsightsAndRecommendations(data, {
    stabilityScore,
    growthScore,
    diversificationScore,
    marketAlignmentScore,
    goalSuitabilityScore
  });

  // Calculate projections
  const projections = calculateIncomeProjections(data);

  return {
    totalScore,
    categoryScores: {
      stability: Math.round(stabilityScore),
      growth: Math.round(growthScore),
      diversification: Math.round(diversificationScore),
      marketAlignment: Math.round(marketAlignmentScore),
      goalSuitability: Math.round(goalSuitabilityScore)
    },
    grade,
    riskLevel,
    insights,
    recommendations,
    projections
  };
};

const calculateStabilityScore = (data: IncomeData): number => {
  const { incomeHistory, incomeSources } = data;

  // Calculate coefficient of variation (lower is better)
  const mean = incomeHistory.reduce((a, b) => a + b, 0) / incomeHistory.length;
  const variance = incomeHistory.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / incomeHistory.length;
  const cv = Math.sqrt(variance) / mean; // Coefficient of variation

  // Weighted average of source stabilities
  const weightedStability = incomeSources.reduce((acc, source) => {
    const weight = source.amount / data.monthlyIncome;
    return acc + (source.stability * weight);
  }, 0);

  // Combine CV and source stability (lower CV and higher source stability = better score)
  const cvScore = Math.max(0, 100 - (cv * 1000)); // Lower CV = higher score
  const stabilityScore = (cvScore * 0.6) + (weightedStability * 100 * 0.4);

  return Math.min(100, Math.max(0, stabilityScore));
};

const calculateGrowthScore = (data: IncomeData): number => {
  const { growthRate, experience, industry } = data;

  // Base score from growth rate
  const growthScore = Math.min(100, growthRate * 1000); // 10% growth = 100 score

  // Adjust for experience (more experience = higher potential)
  const experienceMultiplier = Math.min(1.5, 1 + (experience * 0.05));

  // Adjust for industry growth potential
  const industryMultipliers: Record<string, number> = {
    'technology': 1.2,
    'finance': 1.1,
    'healthcare': 1.1,
    'education': 0.9,
    'retail': 0.8,
    'default': 1.0
  };

  const industryMultiplier = industryMultipliers[industry] || industryMultipliers.default;

  return Math.min(100, growthScore * experienceMultiplier * industryMultiplier);
};

const calculateDiversificationScore = (data: IncomeData): number => {
  const { incomeSources, monthlyIncome } = data;

  if (incomeSources.length === 1) return 30; // Single source = low diversification

  // Calculate Herfindahl-Hirschman Index for income concentration
  const totalIncome = incomeSources.reduce((sum, source) => sum + source.amount, 0);
  const hhi = incomeSources.reduce((acc, source) => {
    const share = source.amount / totalIncome;
    return acc + (share * share);
  }, 0);

  // Convert HHI to score (lower concentration = higher score)
  const diversificationScore = Math.max(0, 100 - (hhi * 100));

  // Bonus for different source types
  const uniqueTypes = new Set(incomeSources.map(s => s.type)).size;
  const typeBonus = Math.min(20, uniqueTypes * 5);

  return Math.min(100, diversificationScore + typeBonus);
};

const calculateMarketAlignmentScore = (data: IncomeData): number => {
  const { monthlyIncome, location, industry, experience } = data;

  // Location-based income benchmarks (simplified)
  const locationMultipliers: Record<string, number> = {
    'metro': 1.0,
    'tier1': 0.85,
    'tier2': 0.7,
    'rural': 0.5
  };

  // Industry-based income benchmarks (simplified)
  const industryBaselines: Record<string, number> = {
    'technology': 80000,
    'finance': 75000,
    'healthcare': 70000,
    'education': 45000,
    'retail': 35000,
    'default': 50000
  };

  const locationMultiplier = locationMultipliers[location] || 1.0;
  const industryBaseline = industryBaselines[industry] || industryBaselines.default;

  // Calculate alignment score
  const expectedIncome = industryBaseline * locationMultiplier;
  const alignmentRatio = data.monthlyIncome / expectedIncome;

  // Score based on how income compares to market expectations
  let alignmentScore = 50; // Neutral starting point

  if (alignmentRatio > 1.2) alignmentScore += 30; // Significantly above market
  else if (alignmentRatio > 1.0) alignmentScore += 15; // Above market
  else if (alignmentRatio > 0.8) alignmentScore += 5; // At market
  else if (alignmentRatio > 0.6) alignmentScore -= 10; // Below market
  else alignmentScore -= 25; // Significantly below market

  // Experience adjustment
  const experienceBonus = Math.min(15, experience * 2);

  return Math.min(100, Math.max(0, alignmentScore + experienceBonus));
};

const calculateGoalSuitabilityScore = (data: IncomeData): number => {
  const { monthlyIncome } = data;

  // Calculate suitability for common financial goals
  const goals = {
    emergencyFund: monthlyIncome * 6, // 6 months
    retirement: monthlyIncome * 0.15, // 15% for retirement
    investment: monthlyIncome * 0.20, // 20% for investments
    majorPurchase: monthlyIncome * 12 // 1 year for major purchase
  };

  // Score based on ability to fund multiple goals simultaneously
  let suitabilityScore = 0;

  if (monthlyIncome >= goals.emergencyFund + goals.retirement + goals.investment) {
    suitabilityScore = 100; // Can fund all goals
  } else if (monthlyIncome >= goals.emergencyFund + goals.retirement) {
    suitabilityScore = 80; // Can fund emergency + retirement
  } else if (monthlyIncome >= goals.emergencyFund + goals.investment) {
    suitabilityScore = 70; // Can fund emergency + investments
  } else if (monthlyIncome >= goals.emergencyFund) {
    suitabilityScore = 60; // Can fund emergency fund
  } else if (monthlyIncome >= goals.majorPurchase * 0.5) {
    suitabilityScore = 40; // Can fund some goals
  } else {
    suitabilityScore = 20; // Limited goal funding capacity
  }

  return suitabilityScore;
};

const getIncomeGrade = (score: number): string => {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C+';
  if (score >= 40) return 'C';
  if (score >= 30) return 'D';
  return 'F';
};

const getIncomeRiskLevel = (score: number): 'low' | 'medium' | 'high' => {
  if (score >= 70) return 'low';
  if (score >= 50) return 'medium';
  return 'high';
};

const generateIncomeInsightsAndRecommendations = (
  data: IncomeData,
  scores: Record<string, number>
): { insights: string[]; recommendations: string[] } => {
  const insights: string[] = [];
  const recommendations: string[] = [];

  // Stability insights
  if (scores.stabilityScore >= 80) {
    insights.push('Excellent income stability with consistent earnings pattern');
  } else if (scores.stabilityScore >= 60) {
    insights.push('Good income stability with minor variations');
  } else {
    insights.push('Income shows significant variability that may impact financial planning');
    recommendations.push('Consider building additional income streams to improve stability');
  }

  // Growth insights
  if (scores.growthScore >= 80) {
    insights.push(`Strong income growth trajectory (${Math.round(data.growthRate * 100)}% annually)`);
  } else if (scores.growthScore >= 60) {
    insights.push('Moderate income growth potential');
  } else {
    insights.push('Limited income growth potential in current role/industry');
    recommendations.push('Explore career advancement opportunities or skill development');
  }

  // Diversification insights
  if (scores.diversificationScore >= 70) {
    insights.push('Well-diversified income sources provide good risk protection');
  } else {
    insights.push('Income heavily dependent on single source');
    recommendations.push('Develop additional income streams (freelance, investments, side business)');
  }

  // Market alignment insights
  if (scores.marketAlignmentScore >= 80) {
    insights.push('Income well-aligned with market expectations for your industry and location');
  } else if (scores.marketAlignmentScore >= 60) {
    insights.push('Income reasonably aligned with market standards');
  } else {
    insights.push('Income below market expectations for your experience level');
    recommendations.push('Consider salary negotiation or career transition to higher-paying roles');
  }

  // Goal suitability insights
  if (scores.goalSuitabilityScore >= 80) {
    insights.push('Income level supports comprehensive financial goal achievement');
  } else if (scores.goalSuitabilityScore >= 60) {
    insights.push('Income supports most major financial goals');
  } else {
    insights.push('Income may limit ability to achieve multiple financial goals simultaneously');
    recommendations.push('Prioritize financial goals and consider phased approach');
  }

  return { insights, recommendations };
};

const calculateIncomeProjections = (data: IncomeData) => {
  const { monthlyIncome, growthRate } = data;

  const nextYear = monthlyIncome * Math.pow(1 + growthRate, 1);
  const fiveYear = monthlyIncome * Math.pow(1 + growthRate, 5);

  // Confidence decreases with time horizon
  const confidence = Math.max(0.6, 1 - (growthRate * 0.5)); // Lower confidence for higher growth rates

  return {
    nextYear: Math.round(nextYear),
    fiveYear: Math.round(fiveYear),
    confidence: Math.round(confidence * 100) / 100
  };
};

// Legacy functions for backward compatibility
export const analyzeIncomeVariance = async (userId: number) => {
  const result = await calculateIncomeSuitabilityScore(userId);
  return {
    stability: result.categoryScores.stability / 100,
    predictedVariance: 1 - (result.categoryScores.stability / 100)
  };
};

export const getIncomePredictions = async (userId: number) => {
  const result = await calculateIncomeSuitabilityScore(userId);
  return {
    nextMonth: result.projections.nextYear / 12,
    confidence: result.projections.confidence
  };
};