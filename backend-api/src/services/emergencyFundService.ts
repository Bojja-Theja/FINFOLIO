import axios from 'axios';

export interface EmergencyFundStatus {
  currentBalance: number;
  targetMonths: number;
  monthlyBurnRate: number;
  monthsCoverage: number;
  status: 'excellent' | 'good' | 'adequate' | 'insufficient' | 'critical';
  recommendedAction: string;
  alerts: string[];
}

export interface EmergencyFundSimulation {
  scenario: string;
  requiredAmount: number;
  currentShortfall: number;
  timeToBuild: number; // months
  monthlyContribution: number;
}

export class EmergencyFundService {
  private static readonly ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

  /**
   * Calculate emergency fund status
   */
  static calculateEmergencyFundStatus(
    currentBalance: number,
    monthlyExpenses: number,
    targetMonths: number = 6
  ): EmergencyFundStatus {
    const monthsCoverage = currentBalance / monthlyExpenses;
    const targetAmount = monthlyExpenses * targetMonths;

    let status: EmergencyFundStatus['status'];
    let recommendedAction: string;
    const alerts: string[] = [];

    if (monthsCoverage >= 12) {
      status = 'excellent';
      recommendedAction = 'Maintain current emergency fund level';
    } else if (monthsCoverage >= 9) {
      status = 'good';
      recommendedAction = 'Consider increasing to 12 months for extra security';
    } else if (monthsCoverage >= 6) {
      status = 'adequate';
      recommendedAction = 'Emergency fund is adequate for most situations';
    } else if (monthsCoverage >= 3) {
      status = 'insufficient';
      recommendedAction = 'Increase emergency fund to at least 6 months coverage';
      alerts.push('Emergency fund covers less than 6 months of expenses');
    } else {
      status = 'critical';
      recommendedAction = 'URGENT: Build emergency fund immediately to 3-6 months';
      alerts.push('CRITICAL: Emergency fund insufficient for basic emergencies');
    }

    // Additional alerts based on coverage
    if (monthsCoverage < 1) {
      alerts.push('Emergency fund covers less than 1 month - extremely vulnerable');
    }

    return {
      currentBalance,
      targetMonths,
      monthlyBurnRate: monthlyExpenses,
      monthsCoverage: Math.round(monthsCoverage * 10) / 10,
      status,
      recommendedAction,
      alerts
    };
  }

  /**
   * Simulate emergency scenarios
   */
  static simulateEmergencyScenarios(
    currentBalance: number,
    monthlyExpenses: number,
    monthlyIncome: number
  ): EmergencyFundSimulation[] {
    const scenarios = [
      {
        scenario: 'Job Loss (3 months)',
        requiredAmount: monthlyExpenses * 3,
        description: '3 months of expenses during job search'
      },
      {
        scenario: 'Medical Emergency',
        requiredAmount: monthlyExpenses * 6,
        description: 'Major medical procedure or hospitalization'
      },
      {
        scenario: 'Car Repair',
        requiredAmount: monthlyExpenses * 1.5,
        description: 'Major vehicle repair or replacement'
      },
      {
        scenario: 'Home Repair',
        requiredAmount: monthlyExpenses * 2,
        description: 'Unexpected home maintenance or repair'
      }
    ];

    return scenarios.map(scenario => {
      const currentShortfall = Math.max(0, scenario.requiredAmount - currentBalance);
      const monthlySavingsCapacity = monthlyIncome - monthlyExpenses;
      const monthlyContribution = Math.max(1000, monthlySavingsCapacity * 0.5); // At least 50% of savings capacity
      const timeToBuild = currentShortfall > 0 ? Math.ceil(currentShortfall / monthlyContribution) : 0;

      return {
        scenario: scenario.scenario,
        requiredAmount: Math.round(scenario.requiredAmount),
        currentShortfall: Math.round(currentShortfall),
        timeToBuild,
        monthlyContribution: Math.round(monthlyContribution)
      };
    });
  }

  /**
   * Get predictive alerts for emergency fund
   */
  static async getPredictiveAlerts(userId: number): Promise<string[]> {
    try {
      // Get user data for prediction
      const alerts: string[] = [];

      // Mock predictive alerts (integrate with ML service)
      const mlResponse = await axios.post(`${this.ML_SERVICE_URL}/predictive-analytics`, {
        user_data: { user_id: userId },
        prediction_type: 'survival_probability',
        time_horizon: '90day'
      });

      const survivalProb = mlResponse.data.predicted_value;
      if (survivalProb < 0.5) {
        alerts.push('High risk of financial distress in next 3 months');
      }

      return alerts;
    } catch (error) {
      console.error('ML service error for predictive alerts:', error);
      return [];
    }
  }

  /**
   * Calculate optimal emergency fund contribution
   */
  static calculateOptimalContribution(
    currentBalance: number,
    monthlyExpenses: number,
    monthlyIncome: number,
    timeHorizonMonths: number = 12
  ): {
    recommendedMonthly: number;
    targetAmount: number;
    timeToTarget: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
  } {
    const targetAmount = monthlyExpenses * 6; // 6 months target
    const shortfall = Math.max(0, targetAmount - currentBalance);
    const monthlySavingsCapacity = Math.max(0, monthlyIncome - monthlyExpenses);

    let recommendedMonthly: number;
    let priority: 'low' | 'medium' | 'high' | 'critical';

    if (shortfall === 0) {
      recommendedMonthly = Math.max(1000, monthlySavingsCapacity * 0.1); // Maintain 10%
      priority = 'low';
    } else {
      const timeToTarget = Math.min(timeHorizonMonths, Math.ceil(shortfall / (monthlySavingsCapacity * 0.5)));
      recommendedMonthly = Math.ceil(shortfall / timeToTarget);

      if (currentBalance / monthlyExpenses < 1) {
        priority = 'critical';
      } else if (currentBalance / monthlyExpenses < 3) {
        priority = 'high';
      } else {
        priority = 'medium';
      }
    }

    return {
      recommendedMonthly: Math.round(recommendedMonthly),
      targetAmount: Math.round(targetAmount),
      timeToTarget: Math.ceil(shortfall / recommendedMonthly) || 0,
      priority
    };
  }

  /**
   * Monitor emergency fund depletion risk
   */
  static monitorDepletionRisk(
    currentBalance: number,
    monthlyExpenses: number,
    monthlyIncome: number,
    jobStability: number // 1-10 scale
  ): {
    depletionRisk: 'low' | 'medium' | 'high';
    monthsUntilCritical: number;
    riskFactors: string[];
  } {
    const monthlyNet = monthlyIncome - monthlyExpenses;
    const riskFactors: string[] = [];

    // Job stability factor
    if (jobStability < 5) {
      riskFactors.push('Low job stability increases depletion risk');
    }

    // Income variability
    if (monthlyNet < monthlyExpenses * 0.1) {
      riskFactors.push('Very low savings capacity');
    }

    // Current coverage
    const monthsCoverage = currentBalance / monthlyExpenses;
    let depletionRisk: 'low' | 'medium' | 'high';
    let monthsUntilCritical: number;

    if (monthsCoverage >= 6) {
      depletionRisk = 'low';
      monthsUntilCritical = monthsCoverage - 3; // Time to drop to 3 months
    } else if (monthsCoverage >= 3) {
      depletionRisk = 'medium';
      monthsUntilCritical = monthsCoverage; // Time to zero
    } else {
      depletionRisk = 'high';
      monthsUntilCritical = monthsCoverage; // Already critical
    }

    return {
      depletionRisk,
      monthsUntilCritical: Math.round(monthsUntilCritical * 10) / 10,
      riskFactors
    };
  }
}