import axios from 'axios';

export interface AllocationInput {
  monthlyIncome: number;
  monthlyExpenses: number;
  emergencyFund: number;
  debtAmount: number;
  age: number;
  riskTolerance: 'low' | 'medium' | 'high';
  jobStability: number; // 1-10 scale
  marketConditions: 'bull' | 'bear' | 'neutral';
  inflationRate: number;
}

export interface AllocationResult {
  sipPercentage: number;
  stocksPercentage: number;
  bondsPercentage: number;
  lifestylePercentage: number;
  emergencyFundPercentage: number;
  allocatedAmounts: {
    sip: number;
    stocks: number;
    bonds: number;
    lifestyle: number;
    emergency: number;
  };
  reasoning: string[];
}

export class AssetAllocationService {
  private static readonly ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

  /**
   * Calculate optimal asset allocation using AI/ML
   */
  static async calculateOptimalAllocation(input: AllocationInput): Promise<AllocationResult> {
    try {
      // Get ML prediction for market conditions and risk
      const mlResponse = await axios.post(`${this.ML_SERVICE_URL}/allocation-optimize`, {
        income: input.monthlyIncome,
        expenses: input.monthlyExpenses,
        emergency_fund: input.emergencyFund,
        debt: input.debtAmount,
        age: input.age,
        risk_tolerance: input.riskTolerance,
        job_stability: input.jobStability,
        market_conditions: input.marketConditions,
        inflation_rate: input.inflationRate
      });

      const aiAllocation = mlResponse.data;

      // Calculate allocated amounts
      const totalIncome = input.monthlyIncome;
      const allocatedAmounts = {
        sip: (aiAllocation.sip_percentage / 100) * totalIncome,
        stocks: (aiAllocation.stocks_percentage / 100) * totalIncome,
        bonds: (aiAllocation.bonds_percentage / 100) * totalIncome,
        lifestyle: (aiAllocation.lifestyle_percentage / 100) * totalIncome,
        emergency: (aiAllocation.emergency_fund_percentage / 100) * totalIncome
      };

      return {
        sipPercentage: aiAllocation.sip_percentage,
        stocksPercentage: aiAllocation.stocks_percentage,
        bondsPercentage: aiAllocation.bonds_percentage,
        lifestylePercentage: aiAllocation.lifestyle_percentage,
        emergencyFundPercentage: aiAllocation.emergency_fund_percentage,
        allocatedAmounts,
        reasoning: aiAllocation.reasoning || []
      };
    } catch (error) {
      console.error('ML service error, falling back to rule-based allocation:', error);
      return this.calculateRuleBasedAllocation(input);
    }
  }

  /**
   * Rule-based allocation as fallback
   */
  private static calculateRuleBasedAllocation(input: AllocationInput): AllocationResult {
    const { monthlyIncome, monthlyExpenses, emergencyFund, debtAmount, age, riskTolerance, jobStability } = input;

    // Base percentages
    let sipPct = 30;
    let stocksPct = 15;
    let bondsPct = 20;
    let lifestylePct = 25;
    let emergencyPct = 10;

    const reasoning: string[] = [];

    // Adjust based on age
    if (age < 30) {
      sipPct += 5;
      stocksPct += 3;
      lifestylePct -= 8;
      reasoning.push('Age < 30: Increased SIP and stocks for long-term growth');
    } else if (age > 50) {
      sipPct -= 5;
      stocksPct -= 5;
      bondsPct += 10;
      reasoning.push('Age > 50: Reduced risk with more bonds');
    }

    // Adjust based on risk tolerance
    if (riskTolerance === 'low') {
      stocksPct -= 5;
      bondsPct += 5;
      reasoning.push('Low risk tolerance: More conservative allocation');
    } else if (riskTolerance === 'high') {
      stocksPct += 5;
      bondsPct -= 5;
      reasoning.push('High risk tolerance: More aggressive allocation');
    }

    // Adjust based on job stability
    if (jobStability < 5) {
      emergencyPct += 5;
      lifestylePct -= 5;
      reasoning.push('Low job stability: Increased emergency fund allocation');
    }

    // Adjust based on debt
    const debtToIncomeRatio = debtAmount / (monthlyIncome * 12);
    if (debtToIncomeRatio > 0.5) {
      lifestylePct -= 5;
      emergencyPct += 5;
      reasoning.push('High debt ratio: Prioritizing emergency fund over lifestyle');
    }

    // Ensure emergency fund adequacy
    const targetEmergencyMonths = 6;
    const currentMonths = emergencyFund / monthlyExpenses;
    if (currentMonths < targetEmergencyMonths) {
      emergencyPct += Math.min(10, (targetEmergencyMonths - currentMonths) * 2);
      lifestylePct -= Math.min(10, (targetEmergencyMonths - currentMonths) * 2);
      reasoning.push(`Emergency fund inadequate: Allocating more to build ${targetEmergencyMonths - currentMonths} months coverage`);
    }

    // Calculate allocated amounts
    const allocatedAmounts = {
      sip: (sipPct / 100) * monthlyIncome,
      stocks: (stocksPct / 100) * monthlyIncome,
      bonds: (bondsPct / 100) * monthlyIncome,
      lifestyle: (lifestylePct / 100) * monthlyIncome,
      emergency: (emergencyPct / 100) * monthlyIncome
    };

    return {
      sipPercentage: sipPct,
      stocksPercentage: stocksPct,
      bondsPercentage: bondsPct,
      lifestylePercentage: lifestylePct,
      emergencyFundPercentage: emergencyPct,
      allocatedAmounts,
      reasoning
    };
  }

  /**
   * Calculate SIP CAGR (Compound Annual Growth Rate)
   */
  static calculateSipCagr(monthlyInvestment: number, years: number, expectedReturn: number): number {
    const monthlyRate = expectedReturn / 12 / 100;
    const months = years * 12;
    const futureValue = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const totalInvested = monthlyInvestment * months;
    const cagr = Math.pow(futureValue / totalInvested, 1 / years) - 1;
    return cagr * 100;
  }

  /**
   * Calculate emergency fund months coverage
   */
  static calculateEmergencyFundMonths(emergencyFund: number, monthlyExpenses: number): number {
    return emergencyFund / monthlyExpenses;
  }

  /**
   * Calculate debt-to-income ratio
   */
  static calculateDebtToIncomeRatio(debtAmount: number, annualIncome: number): number {
    return (debtAmount / annualIncome) * 100;
  }

  /**
   * Calculate savings rate
   */
  static calculateSavingsRate(income: number, expenses: number): number {
    return ((income - expenses) / income) * 100;
  }

  /**
   * Calculate investment risk score (1-10 scale)
   */
  static calculateInvestmentRiskScore(allocation: AllocationResult): number {
    const riskWeights = {
      sip: 0.6, // Moderate risk
      stocks: 0.9, // High risk
      bonds: 0.3, // Low risk
      lifestyle: 0, // No risk (spending)
      emergency: 0 // No risk (safety)
    };

    const totalRisk = (
      allocation.sipPercentage * riskWeights.sip +
      allocation.stocksPercentage * riskWeights.stocks +
      allocation.bondsPercentage * riskWeights.bonds
    ) / (allocation.sipPercentage + allocation.stocksPercentage + allocation.bondsPercentage);

    return Math.round(totalRisk * 10);
  }

  /**
   * Calculate stability index (0-100)
   */
  static calculateStabilityIndex(
    emergencyMonths: number,
    savingsRate: number,
    debtRatio: number,
    jobStability: number
  ): number {
    const emergencyScore = Math.min(emergencyMonths / 6, 1) * 25;
    const savingsScore = Math.min(savingsRate / 20, 1) * 25;
    const debtScore = Math.max(0, (1 - debtRatio / 50)) * 25;
    const jobScore = (jobStability / 10) * 25;

    return Math.round(emergencyScore + savingsScore + debtScore + jobScore);
  }

  /**
   * Calculate lifestyle inflation index
   */
  static calculateLifestyleInflationIndex(
    currentExpenses: number,
    previousExpenses: number,
    incomeGrowth: number
  ): number {
    const expenseGrowth = ((currentExpenses - previousExpenses) / previousExpenses) * 100;
    return expenseGrowth - incomeGrowth;
  }
}