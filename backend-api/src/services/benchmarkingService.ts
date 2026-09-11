import { Pool } from 'pg';
import { logger } from '../utils/logger';

export interface BenchmarkData {
  incomeBracket: string;
  ageGroup: string;
  averageHealthScore: number;
  averageSurvivalPeriod: number;
  percentileRank: number;
  totalUsers: number;
}

export class BenchmarkingService {
  constructor(private db: Pool) {}

  async getBenchmarkData(userId: string, income: number, age: number): Promise<BenchmarkData> {
    try {
      // Determine income bracket and age group
      const incomeBracket = this.getIncomeBracket(income);
      const ageGroup = this.getAgeGroup(age);

      // Get aggregated data for the bracket
      const query = `
        SELECT
          AVG(health_score) as average_health_score,
          AVG(survival_period) as average_survival_period,
          COUNT(*) as total_users
        FROM user_financial_profiles
        WHERE income_bracket = $1 AND age_group = $2
      `;
      const result = await this.db.query(query, [incomeBracket, ageGroup]);

      if (result.rows.length === 0) {
        throw new Error('No benchmark data available for this demographic');
      }

      const { average_health_score, average_survival_period, total_users } = result.rows[0];

      // Get user's percentile rank
      const percentileQuery = `
        SELECT
          ROUND(
            (SELECT COUNT(*) FROM user_financial_profiles
             WHERE income_bracket = $1 AND age_group = $2 AND health_score <=
             (SELECT health_score FROM user_financial_profiles WHERE user_id = $3))::numeric /
            COUNT(*)::numeric * 100, 1
          ) as percentile_rank
        FROM user_financial_profiles
        WHERE income_bracket = $1 AND age_group = $2
      `;
      const percentileResult = await this.db.query(percentileQuery, [incomeBracket, ageGroup, userId]);
      const percentileRank = percentileResult.rows[0]?.percentile_rank || 0;

      return {
        incomeBracket,
        ageGroup,
        averageHealthScore: parseFloat(average_health_score) || 0,
        averageSurvivalPeriod: parseFloat(average_survival_period) || 0,
        percentileRank: parseFloat(percentileRank) || 0,
        totalUsers: parseInt(total_users) || 0
      };
    } catch (error) {
      logger.error('Error fetching benchmark data:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private getIncomeBracket(income: number): string {
    if (income < 30000) return 'Under $30K';
    if (income < 50000) return '$30K-$50K';
    if (income < 75000) return '$50K-$75K';
    if (income < 100000) return '$75K-$100K';
    if (income < 150000) return '$100K-$150K';
    return 'Over $150K';
  }

  private getAgeGroup(age: number): string {
    if (age < 25) return '18-24';
    if (age < 35) return '25-34';
    if (age < 45) return '35-44';
    if (age < 55) return '45-54';
    if (age < 65) return '55-64';
    return '65+';
  }

  async updateUserProfile(userId: string, income: number, age: number, healthScore: number, survivalPeriod: number): Promise<void> {
    try {
      const incomeBracket = this.getIncomeBracket(income);
      const ageGroup = this.getAgeGroup(age);

      const query = `
        INSERT INTO user_financial_profiles (user_id, income_bracket, age_group, health_score, survival_period, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET
          income_bracket = EXCLUDED.income_bracket,
          age_group = EXCLUDED.age_group,
          health_score = EXCLUDED.health_score,
          survival_period = EXCLUDED.survival_period,
          updated_at = NOW()
      `;
      await this.db.query(query, [userId, incomeBracket, ageGroup, healthScore, survivalPeriod]);
    } catch (error) {
      logger.error('Error updating user profile for benchmarking:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
}