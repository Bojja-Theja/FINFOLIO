import { Request, Response } from 'express';
import { query } from '../config/db';
import { logger } from '../utils/logger';
import { cache } from '../config/cache';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const cacheKey = `user_profile_${userId}`;

    // Check cache first
    let profileData = await cache.get(cacheKey);
    if (!profileData) {
      const startTime = Date.now();
      const result = await query(`
        SELECT
          u.id, u.email, u.name, u.created_at, u.updated_at,
          up.monthly_income, up.monthly_expenses, up.emergency_fund,
          up.savings_rate, up.location, up.industry, up.experience_years
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.id = $1
      `, [userId]);
      const queryDuration = Date.now() - startTime;
      logger.info(`User profile query for user ${userId} took ${queryDuration}ms`);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const row = result.rows[0];
      profileData = {
        id: row.id,
        email: row.email,
        name: row.name,
        monthlyIncome: row.monthly_income,
        monthlyExpenses: row.monthly_expenses,
        emergencyFund: row.emergency_fund,
        savingsRate: row.savings_rate,
        location: row.location,
        industry: row.industry,
        experienceYears: row.experience_years,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };

      // Cache for 5 minutes
      await cache.set(cacheKey, profileData, 300);
    }

    res.json(profileData);
  } catch (error) {
    logger.error(`Failed to get user profile for user ${(req as any).userId}: ${error}`);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const {
      name,
      email,
      location,
      industry,
      experience_years,
      monthly_income,
      monthly_expenses,
      emergency_fund,
      emergency_fund_balance,
      savings_rate,
      total_debt,
      age,
      risk_tolerance,
      job_stability_score,
      // Support camelCase for frontend flexibility
      experienceYears,
      monthlyIncome,
      monthlyExpenses,
      emergencyFund,
      emergencyFundBalance,
      savingsRate,
      totalDebt,
      riskTolerance,
      jobStabilityScore
    } = req.body;

    // Update user basic info
    if (name || email) {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (name) {
        updateFields.push(`name = $${paramIndex++}`);
        values.push(name);
      }
      if (email) {
        updateFields.push(`email = $${paramIndex++}`);
        values.push(email);
      }

      updateFields.push(`updated_at = $${paramIndex++}`);
      values.push(new Date());
      values.push(userId);

      const userQuery = `
        UPDATE users
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
      `;

      await query(userQuery, values);
    }

    // Update or insert user profile
    const profileQuery = `
      INSERT INTO user_profiles (
        user_id, monthly_income, monthly_expenses, emergency_fund,
        emergency_fund_balance, savings_rate, total_debt, age,
        risk_tolerance, job_stability_score, location, industry, 
        experience_years, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (user_id)
      DO UPDATE SET
        monthly_income = EXCLUDED.monthly_income,
        monthly_expenses = EXCLUDED.monthly_expenses,
        emergency_fund = EXCLUDED.emergency_fund,
        emergency_fund_balance = EXCLUDED.emergency_fund_balance,
        savings_rate = EXCLUDED.savings_rate,
        total_debt = EXCLUDED.total_debt,
        age = EXCLUDED.age,
        risk_tolerance = EXCLUDED.risk_tolerance,
        job_stability_score = EXCLUDED.job_stability_score,
        location = EXCLUDED.location,
        industry = EXCLUDED.industry,
        experience_years = EXCLUDED.experience_years,
        updated_at = EXCLUDED.updated_at
    `;

    await query(profileQuery, [
      userId,
      monthly_income || monthlyIncome || 0,
      monthly_expenses || monthlyExpenses || 0,
      emergency_fund || emergencyFund || 0,
      emergency_fund_balance || emergencyFundBalance || 0,
      savings_rate || savingsRate || 0,
      total_debt || totalDebt || 0,
      age || 0,
      risk_tolerance || riskTolerance || 'medium',
      job_stability_score || jobStabilityScore || 5,
      location || null,
      industry || null,
      experience_years || experienceYears || null,
      new Date(),
      new Date()
    ]);

    // Clear cache after update
    const cacheKey = `user_profile_${userId}`;
    await cache.delete(cacheKey);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    logger.error(`Failed to update user profile for user ${(req as any).userId}: ${error}`);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};