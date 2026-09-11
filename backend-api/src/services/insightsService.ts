import { calculateHealthScore } from './healthScoreService';
import { calculateSurvivalMonths } from './survivalService';
import { calculateIncomeSuitabilityScore } from './incomeVarianceService';
import { getSavingsStatus, getDisciplineInsights } from './savingsService';
import { logger } from '../utils/logger';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  priority: 'high' | 'medium' | 'low';
  category: 'savings' | 'spending' | 'income' | 'emergency' | 'investment' | 'debt';
  title: string;
  message: string;
  actionable: boolean;
  timestamp: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

interface Insight {
  id: string;
  type: 'trend' | 'opportunity' | 'risk' | 'achievement';
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number; // 0-1
  timestamp: Date;
  recommendations?: string[];
}

interface InsightsResult {
  alerts: Alert[];
  insights: Insight[];
  summary: {
    criticalCount: number;
    warningCount: number;
    opportunityCount: number;
    achievementsCount: number;
  };
  trends: {
    spendingTrend: 'increasing' | 'decreasing' | 'stable';
    savingsTrend: 'improving' | 'declining' | 'stable';
    healthTrend: 'improving' | 'declining' | 'stable';
  };
}

export const generateComprehensiveInsights = async (userId: number): Promise<InsightsResult> => {
  // Gather data from all services
  const healthScore = await calculateHealthScore(userId);
  const survival = await calculateSurvivalMonths(userId);
  const incomeScore = await calculateIncomeSuitabilityScore(userId);
  const savingsStatus = await getSavingsStatus(userId);
  const disciplineInsights = getDisciplineInsights(userId);

  // Generate alerts based on all data
  const alerts = generateAlerts(userId, {
    healthScore,
    survival,
    incomeScore,
    savingsStatus,
    disciplineInsights
  });

  // Generate insights based on patterns and trends
  const insights = generateDetailedInsights(userId, {
    healthScore,
    survival,
    incomeScore,
    savingsStatus,
    disciplineInsights
  });

  // Calculate summary statistics
  const summary = {
    criticalCount: alerts.filter(a => a.type === 'critical').length,
    warningCount: alerts.filter(a => a.type === 'warning').length,
    opportunityCount: insights.filter(i => i.type === 'opportunity').length,
    achievementsCount: insights.filter(i => i.type === 'achievement').length
  };

  // Determine trends (simplified - would use historical data in production)
  const trends = {
    spendingTrend: 'stable' as 'increasing' | 'decreasing' | 'stable',
    savingsTrend: (savingsStatus.disciplineScore > 80 ? 'improving' : 'stable') as 'improving' | 'declining' | 'stable',
    healthTrend: (healthScore.totalScore > 75 ? 'improving' : 'stable') as 'improving' | 'declining' | 'stable'
  };

  return {
    alerts,
    insights,
    summary,
    trends
  };
};

const generateAlerts = (userId: number, data: any): Alert[] => {
  const alerts: Alert[] = [];
  const now = new Date();

  // Health Score Alerts
  if (data.healthScore.totalScore < 50) {
    alerts.push({
      id: `health_critical_${userId}`,
      type: 'critical',
      priority: 'high',
      category: 'emergency',
      title: 'Critical Financial Health Alert',
      message: `Your financial health score is critically low at ${data.healthScore.totalScore}. Immediate action required.`,
      actionable: true,
      timestamp: now,
      metadata: { score: data.healthScore.totalScore }
    });
  } else if (data.healthScore.totalScore < 70) {
    alerts.push({
      id: `health_warning_${userId}`,
      type: 'warning',
      priority: 'medium',
      category: 'savings',
      title: 'Financial Health Needs Attention',
      message: `Your financial health score of ${data.healthScore.totalScore} indicates areas for improvement.`,
      actionable: true,
      timestamp: now,
      metadata: { score: data.healthScore.totalScore }
    });
  }

  // Emergency Fund Alerts
  if (data.survival.riskLevel === 'critical') {
    alerts.push({
      id: `emergency_critical_${userId}`,
      type: 'critical',
      priority: 'high',
      category: 'emergency',
      title: 'Emergency Fund Critical',
      message: `You can only survive ${data.survival.months} months financially. Build emergency fund immediately.`,
      actionable: true,
      timestamp: now,
      metadata: { months: data.survival.months }
    });
  } else if (data.survival.riskLevel === 'high') {
    alerts.push({
      id: `emergency_warning_${userId}`,
      type: 'warning',
      priority: 'medium',
      category: 'emergency',
      title: 'Emergency Fund Low',
      message: `Your emergency coverage of ${data.survival.months} months is below recommended levels.`,
      actionable: true,
      timestamp: now,
      metadata: { months: data.survival.months }
    });
  }

  // Savings Discipline Alerts
  if (data.savingsStatus.disciplineScore < 60) {
    alerts.push({
      id: `discipline_warning_${userId}`,
      type: 'warning',
      priority: 'medium',
      category: 'savings',
      title: 'Savings Discipline Alert',
      message: `Your savings discipline score is ${data.savingsStatus.disciplineScore}. Consider strengthening your saving habits.`,
      actionable: true,
      timestamp: now,
      metadata: { score: data.savingsStatus.disciplineScore }
    });
  }

  // Income Stability Alerts
  if (data.incomeScore.riskLevel === 'high') {
    alerts.push({
      id: `income_warning_${userId}`,
      type: 'warning',
      priority: 'medium',
      category: 'income',
      title: 'Income Stability Concern',
      message: `Your income stability score of ${data.incomeScore.totalScore} indicates potential financial vulnerability.`,
      actionable: true,
      timestamp: now,
      metadata: { score: data.incomeScore.totalScore }
    });
  }

  // Spending Alerts (based on discipline insights)
  const spendingAlerts = data.disciplineInsights.insights.filter((insight: string) =>
    insight.toLowerCase().includes('spending') || insight.toLowerCase().includes('expense')
  );

  if (spendingAlerts.length > 0) {
    alerts.push({
      id: `spending_info_${userId}`,
      type: 'info',
      priority: 'low',
      category: 'spending',
      title: 'Spending Pattern Insight',
      message: spendingAlerts[0],
      actionable: true,
      timestamp: now
    });
  }

  return alerts;
};

const generateDetailedInsights = (userId: number, data: any): Insight[] => {
  const insights: Insight[] = [];
  const now = new Date();

  // Achievement Insights
  if (data.healthScore.totalScore >= 80) {
    insights.push({
      id: `achievement_health_${userId}`,
      type: 'achievement',
      category: 'health',
      title: 'Financial Health Champion',
      description: `Congratulations! Your financial health score of ${data.healthScore.totalScore} (${data.healthScore.grade}) demonstrates excellent financial management.`,
      impact: 'high',
      confidence: 1.0,
      timestamp: now
    });
  }

  if (data.survival.months >= 12) {
    insights.push({
      id: `achievement_emergency_${userId}`,
      type: 'achievement',
      category: 'emergency',
      title: 'Emergency Preparedness Master',
      description: `Outstanding! You have ${data.survival.months} months of emergency coverage, providing excellent financial security.`,
      impact: 'high',
      confidence: 1.0,
      timestamp: now
    });
  }

  // Opportunity Insights
  if (data.incomeScore.categoryScores.growth < 70) {
    insights.push({
      id: `opportunity_growth_${userId}`,
      type: 'opportunity',
      category: 'income',
      title: 'Income Growth Opportunity',
      description: 'Your industry and experience suggest potential for higher earnings. Consider skill development or career advancement.',
      impact: 'high',
      confidence: 0.8,
      timestamp: now,
      recommendations: [
        'Pursue professional certifications',
        'Network with industry leaders',
        'Consider higher-paying roles in your field'
      ]
    });
  }

  if (data.savingsStatus.disciplineScore >= 85) {
    insights.push({
      id: `opportunity_investment_${userId}`,
      type: 'opportunity',
      category: 'investment',
      title: 'Investment Ready',
      description: 'Your strong savings discipline indicates readiness for investment opportunities.',
      impact: 'medium',
      confidence: 0.9,
      timestamp: now,
      recommendations: [
        'Consider diversified investment portfolio',
        'Explore tax-advantaged investment options',
        'Consult with financial advisor for personalized strategy'
      ]
    });
  }

  // Risk Insights
  if (data.incomeScore.categoryScores.diversification < 60) {
    insights.push({
      id: `risk_diversification_${userId}`,
      type: 'risk',
      category: 'income',
      title: 'Income Concentration Risk',
      description: 'Heavy reliance on single income source increases financial vulnerability.',
      impact: 'high',
      confidence: 0.85,
      timestamp: now,
      recommendations: [
        'Develop side income streams',
        'Build freelance or consulting skills',
        'Consider passive income investments'
      ]
    });
  }

  // Trend Insights
  if (data.savingsStatus.monthlyAutoSave > 0) {
    insights.push({
      id: `trend_savings_${userId}`,
      type: 'trend',
      category: 'savings',
      title: 'Positive Savings Momentum',
      description: `Auto-saving ₹${data.savingsStatus.monthlyAutoSave} monthly shows strong financial discipline.`,
      impact: 'medium',
      confidence: 0.9,
      timestamp: now
    });
  }

  return insights;
};

// Legacy functions for backward compatibility
export const generateInsights = async (userId: number) => {
  const result = await generateComprehensiveInsights(userId);
  return {
    insights: result.insights.map((i: Insight) => i.description),
    trends: result.trends
  };
};

export const getAlerts = async (userId: number) => {
  const result = await generateComprehensiveInsights(userId);
  return {
    alerts: result.alerts.map((a: Alert) => ({
      id: parseInt(a.id.split('_').pop() || '0'),
      message: a.message,
      type: a.type === 'critical' ? 'error' : a.type === 'warning' ? 'warning' : 'info'
    }))
  };
};