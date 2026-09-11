import { DatabaseService } from './databaseService';

interface SurvivalInputs {
  emergencyFund: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  incomeStability: number; // 0-1 scale
  hasSideIncome: boolean;
  dependents: number;
  location: string; // affects cost of living
  jobSecurity: number; // 0-1 scale
}

interface SurvivalResult {
  months: number;
  breakdown: {
    emergencyFund: number;
    monthlyExpenses: number;
    adjustedExpenses: number;
    conservativeMonths: number;
    moderateMonths: number;
    optimisticMonths: number;
  };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  scenarios: {
    jobLoss: number;
    medicalEmergency: number;
    marketCrash: number;
  };
  recommendations: string[];
}

export const calculateSurvivalMonths = async (userId: number): Promise<SurvivalResult> => {
  // Fetch real user data from database
  const userData = await DatabaseService.getUserFinancialData(userId);

  if (!userData) {
    // Fallback to mock data if no user data found
    const mockInputs: SurvivalInputs = {
      emergencyFund: 600000,
      monthlyExpenses: 45000,
      monthlyIncome: 75000,
      incomeStability: 0.8,
      hasSideIncome: false,
      dependents: 2,
      location: 'metro',
      jobSecurity: 0.7
    };
    return calculateSurvivalFromInputs(mockInputs);
  }

  // Map database data to SurvivalInputs
  const survivalInputs: SurvivalInputs = {
    emergencyFund: userData.emergencyFund,
    monthlyExpenses: userData.monthlyExpenses,
    monthlyIncome: userData.monthlyIncome,
    incomeStability: userData.jobStability / 10, // Assuming jobStability is 0-10 scale
    hasSideIncome: false, // TODO: Add to user profile
    dependents: 0, // TODO: Add to user profile
    location: 'metro', // TODO: Use from user profile
    jobSecurity: userData.jobStability / 10
  };

  return calculateSurvivalFromInputs(survivalInputs);
};

export const calculateSurvivalFromInputs = (inputs: SurvivalInputs): SurvivalResult => {
  const {
    emergencyFund,
    monthlyExpenses,
    monthlyIncome: _monthlyIncome,
    incomeStability,
    hasSideIncome: _hasSideIncome,
    dependents,
    location,
    jobSecurity
  } = inputs;

  // Adjust expenses based on emergency scenario (typically 20-30% reduction possible)
  const emergencyExpenseReduction = 0.25; // 25% reduction in discretionary spending
  const adjustedMonthlyExpenses = monthlyExpenses * (1 - emergencyExpenseReduction);

  // Calculate base survival months
  const baseMonths = emergencyFund / adjustedMonthlyExpenses;

  // Apply risk adjustments
  const stabilityFactor = incomeStability * 0.8 + jobSecurity * 0.2; // Weighted average
  const locationMultiplier = location === 'metro' ? 1.2 : location === 'tier2' ? 1.0 : 0.8;
  const dependentMultiplier = 1 + (dependents * 0.1); // 10% increase per dependent

  // Conservative scenario (worst case)
  const conservativeMonths = Math.floor(
    baseMonths * stabilityFactor * 0.7 * locationMultiplier * dependentMultiplier
  );

  // Moderate scenario (realistic)
  const moderateMonths = Math.floor(
    baseMonths * stabilityFactor * 0.9 * locationMultiplier * dependentMultiplier
  );

  // Optimistic scenario (best case)
  const optimisticMonths = Math.floor(
    baseMonths * stabilityFactor * 1.1 * locationMultiplier * dependentMultiplier
  );

  // Determine risk level
  const riskLevel = getRiskLevel(conservativeMonths);

  // Calculate scenario-specific survival periods
  const scenarios = {
    jobLoss: Math.floor(conservativeMonths * 0.8), // Job loss reduces available time
    medicalEmergency: Math.floor(conservativeMonths * 0.6), // Medical emergencies drain funds faster
    marketCrash: Math.floor(conservativeMonths * 0.9) // Market crash affects investments
  };

  // Generate recommendations
  const recommendations = generateSurvivalRecommendations(inputs, conservativeMonths);

  return {
    months: moderateMonths, // Return moderate scenario as primary
    breakdown: {
      emergencyFund,
      monthlyExpenses,
      adjustedExpenses: adjustedMonthlyExpenses,
      conservativeMonths,
      moderateMonths,
      optimisticMonths
    },
    riskLevel,
    scenarios,
    recommendations
  };
};

const getRiskLevel = (months: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (months >= 12) return 'low';
  if (months >= 6) return 'medium';
  if (months >= 3) return 'high';
  return 'critical';
};

const generateSurvivalRecommendations = (inputs: SurvivalInputs, months: number): string[] => {
  const recommendations: string[] = [];

  if (months < 3) {
    recommendations.push('CRITICAL: Build emergency fund immediately - target 3-6 months of expenses');
    recommendations.push('Reduce discretionary spending by 30-50% temporarily');
    recommendations.push('Consider part-time work or side income sources');
  } else if (months < 6) {
    recommendations.push('HIGH PRIORITY: Increase emergency fund to at least 6 months coverage');
    recommendations.push('Review and optimize monthly expenses');
    recommendations.push('Explore additional income streams for stability');
  } else if (months < 12) {
    recommendations.push('MODERATE: Aim for 12 months of emergency coverage');
    recommendations.push('Continue building savings consistently');
    recommendations.push('Consider high-yield savings options for emergency fund');
  } else {
    recommendations.push('EXCELLENT: Maintain current emergency preparedness');
    recommendations.push('Consider investing excess emergency funds appropriately');
  }

  // Location-specific recommendations
  if (inputs.location === 'metro' && inputs.monthlyExpenses > 40000) {
    recommendations.push('Consider relocation to reduce cost of living if feasible');
  }

  // Dependent-specific recommendations
  if (inputs.dependents > 2) {
    recommendations.push('Review family insurance coverage for comprehensive protection');
  }

  // Income stability recommendations
  if (inputs.incomeStability < 0.7) {
    recommendations.push('Diversify income sources to improve financial stability');
  }

  return recommendations;
};

export const getSurvivalTips = async (userId: number) => {
  const result = await calculateSurvivalMonths(userId);
  return {
    tips: result.recommendations,
    riskLevel: result.riskLevel,
    months: result.months,
    scenarios: result.scenarios
  };
};

// Additional utility functions for different calculation scenarios
export const calculateScenarioSurvival = (
  emergencyFund: number,
  monthlyExpenses: number,
  scenario: 'conservative' | 'moderate' | 'optimistic'
): number => {
  const baseMonths = emergencyFund / monthlyExpenses;
  const multipliers = {
    conservative: 0.7,
    moderate: 0.9,
    optimistic: 1.1
  };

  return Math.floor(baseMonths * multipliers[scenario]);
};