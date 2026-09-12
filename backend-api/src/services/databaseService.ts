import bcrypt from 'bcrypt';
import { query } from '../config/db.js';
import { logger } from '../utils/logger.js';
import { Wallet, WalletTransaction } from '../models/Wallet.js';
import { AccountabilityPartner, CommitmentRule, WithdrawalRequest, WithdrawalStatus, PartnerNotification } from '../models/Accountability.js';

// In-memory storage for demo and test fallback purposes
interface InMemoryUser {
  id: number;
  email: string;
  password: string; // stores bcrypt hash of PIN
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const inMemoryUsers: InMemoryUser[] = [];
let nextUserId = 1;
let useInMemory = false;

const inMemoryWallets: Wallet[] = [];
let nextWalletId = 1;

const inMemoryTransactions: WalletTransaction[] = [];
let nextTxId = 1;

const inMemoryPartners: AccountabilityPartner[] = [];
let nextPartnerId = 1;

const inMemoryRules: CommitmentRule[] = [];
let nextRuleId = 1;

const inMemoryWithdrawals: WithdrawalRequest[] = [];
let nextWithdrawalId = 1;

const inMemoryNotifications: PartnerNotification[] = [];
let nextNotificationId = 1;

const inMemoryAuditLogs: any[] = [];


export interface UserFinancialData {
  userId: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  emergencyFund: number;
  debtAmount: number;
  age: number;
  riskTolerance: 'low' | 'medium' | 'high';
  jobStability: number;
  marketConditions: 'bull' | 'bear' | 'neutral';
  inflationRate: number;
}

export interface AssetAllocationData {
  userId: number;
  sipPercentage: number;
  stocksPercentage: number;
  bondsPercentage: number;
  lifestylePercentage: number;
  emergencyFundPercentage: number;
  sipAmount: number;
  stocksAmount: number;
  bondsAmount: number;
  lifestyleAmount: number;
  emergencyAmount: number;
  reasoning: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyFundData {
  userId: number;
  currentBalance: number;
  targetMonths: number;
  monthlyBurnRate: number;
  monthsCoverage: number;
  status: 'excellent' | 'good' | 'adequate' | 'insufficient' | 'critical';
  recommendedAction: string;
  alerts: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class DatabaseService {
  /**
   * Get user financial data from database
   */
  static async getUserFinancialData(userId: number): Promise<UserFinancialData | null> {
    try {
        // Note: align selected columns with current DB schema (user_profiles columns)
        const result = await query(`
          SELECT
            u.id as user_id,
            COALESCE(up.monthly_income, 0) as monthly_income,
            COALESCE(up.monthly_expenses, 0) as monthly_expenses,
            COALESCE(up.emergency_fund, 0) as emergency_fund,
            -- total debt aggregated from debts table if present
            COALESCE((SELECT SUM(outstanding_amount) FROM debts WHERE user_id = $1), 0) as debt_amount,
            COALESCE(up.experience_years, 30) as age,
            COALESCE(up.savings_rate, 0.0) as risk_tolerance,
            COALESCE(5, 5) as job_stability,
            'neutral' as market_conditions,
            6.0 as inflation_rate
          FROM users u
          LEFT JOIN user_profiles up ON u.id = up.user_id
          WHERE u.id = $1
        `, [userId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        userId: row.user_id,
        monthlyIncome: parseFloat(row.monthly_income),
        monthlyExpenses: parseFloat(row.monthly_expenses),
        emergencyFund: parseFloat(row.emergency_fund),
        debtAmount: parseFloat(row.debt_amount),
        age: parseInt(row.age),
        riskTolerance: row.risk_tolerance,
        jobStability: parseInt(row.job_stability),
        marketConditions: row.market_conditions,
        inflationRate: parseFloat(row.inflation_rate)
      };
    } catch (error) {
      logger.error(`Failed to get user financial data for user ${userId}: ${error}`);
      return null;
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<{ id: number; email: string; name: string } | null> {
    try {
      const result = await query(`SELECT id, email, name FROM users WHERE email = $1 LIMIT 1`, [email]);
      if (result.rows.length > 0) {
        return result.rows[0];
      }
      return null;
    } catch (error) {
      logger.error(`Failed to get user by email ${email}: ${error}`);
      // Fallback to in-memory
      if (useInMemory) {
        const user = inMemoryUsers.find(u => u.email === email);
        return user ? { id: user.id, email: user.email, name: user.name } : null;
      }
      return null;
    }
  }

  /**
   * Hash a 4-digit PIN using bcrypt
   */
  static async hashPin(pin: string): Promise<string> {
    return await bcrypt.hash(pin, 10);
  }

  /**
   * Compare a candidate PIN with a stored hash or plaintext PIN
   */
  static async comparePin(pin: string, storedPin: string): Promise<boolean> {
    if (!storedPin) return false;
    if (storedPin.startsWith('$2a$') || storedPin.startsWith('$2b$')) {
      return await bcrypt.compare(pin, storedPin);
    }
    return storedPin === pin;
  }

  /**
   * Get user by email and pin for authentication
   */
  static async getUserByEmailAndPin(email: string, pin: string): Promise<{ id: number; email: string; name: string } | null> {
    if (useInMemory) {
      const user = inMemoryUsers.find(u => u.email === email);
      if (user) {
        const isMatch = await this.comparePin(pin, user.password);
        if (isMatch) {
          return { id: user.id, email: user.email, name: user.name };
        }
      }
      return null;
    }

    try {
      const result = await query(`SELECT id, email, name, pin FROM users WHERE email = $1 LIMIT 1`, [email]);
      if (result.rows.length > 0) {
        const row = result.rows[0];
        const isMatch = await this.comparePin(pin, row.pin);
        if (isMatch) {
          return { id: row.id, email: row.email, name: row.name };
        }
        return null;
      }
      return null;
    } catch (error) {
      logger.error(`Failed to get user by email and pin ${email}: ${error}`);
      // Fallback to in-memory
      if (useInMemory) {
        const user = inMemoryUsers.find(u => u.email === email);
        if (user) {
          const isMatch = await this.comparePin(pin, user.password);
          if (isMatch) {
            return { id: user.id, email: user.email, name: user.name };
          }
        }
        return null;
      }
      return null;
    }
  }

  /**
   * Get user by ID with resilient in-memory fallback
   */
  static async getUserById(userId: number): Promise<{ id: number; email: string; name: string } | null> {
    if (useInMemory) {
      const user = inMemoryUsers.find(u => u.id === userId);
      return user ? { id: user.id, email: user.email, name: user.name } : null;
    }

    try {
      const result = await query(`SELECT id, email, name FROM users WHERE id = $1 LIMIT 1`, [userId]);
      if (result.rows.length > 0) {
        return {
          id: result.rows[0].id,
          email: result.rows[0].email,
          name: result.rows[0].name
        };
      }
      return null;
    } catch (error) {
      logger.warn(`Failed to get user by id ${userId} from database: ${error}`);
      const user = inMemoryUsers.find(u => u.id === userId);
      return user ? { id: user.id, email: user.email, name: user.name } : null;
    }
  }

  /**
   * Verify user PIN
   */
  static async verifyUserPin(userId: number, pin: string): Promise<boolean> {
    if (useInMemory) {
      const user = inMemoryUsers.find(u => u.id === userId);
      if (user) {
        return await this.comparePin(pin, user.password);
      }
      return false;
    }

    try {
      const result = await query(`SELECT pin FROM users WHERE id = $1 LIMIT 1`, [userId]);
      if (result.rows.length > 0) {
        return await this.comparePin(pin, result.rows[0].pin);
      }
      return false;
    } catch (error) {
      logger.error(`Failed to verify PIN for user ${userId}: ${error}`);
      const user = inMemoryUsers.find(u => u.id === userId);
      if (user) {
        return await this.comparePin(pin, user.password);
      }
      return false;
    }
  }

  /**
   * Create guest user
   */
  static async createGuestUser(email: string, name: string): Promise<number> {
    if (useInMemory) {
      const existingUser = inMemoryUsers.find(u => u.email === email);
      if (existingUser) {
        throw new Error('Guest user already exists');
      }
      const hashedPin = await this.hashPin('0000');
      const newUser: InMemoryUser = {
        id: nextUserId++,
        email,
        password: hashedPin,
        name,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryUsers.push(newUser);
      return newUser.id;
    }

    try {
      logger.info(`Creating guest user with email: ${email}, name: ${name}`);
      const hashedPin = await this.hashPin('0000');

      const result = await query(
        `INSERT INTO users (email, name, pin, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING id`,
        [email, name, hashedPin] // Default hashed PIN for guest users
      );

      if (result.rows.length > 0) {
        const userId = result.rows[0].id;
        logger.info(`Guest user created successfully with id: ${userId}`);

        // Create default user profile for guest
        try {
          await query(
            `INSERT INTO user_profiles (user_id, monthly_income, monthly_expenses, emergency_fund, savings_rate, experience_years, created_at, updated_at)
             VALUES ($1, 0, 0, 0, 0.0, 30, NOW(), NOW())
             ON CONFLICT (user_id) DO NOTHING`,
            [userId]
          );
          logger.info(`Guest user profile created for user ${userId}`);
        } catch (e) {
          logger.error(`Failed to create guest user_profile for user ${userId}: ${e}`);
          // Don't fail the registration if profile creation fails
        }
        return userId;
      }
      logger.error('No rows returned after guest user insert');
      return 0;
    } catch (error: any) {
      logger.error(`Failed to create guest user for email ${email}: ${error.message || error}`);
      console.error('Full error:', error);

      // Fallback to in-memory storage
      logger.info('Falling back to in-memory storage for guest user');
      useInMemory = true;
      const existingUser = inMemoryUsers.find(u => u.email === email);
      if (existingUser) {
        throw new Error('Guest user already exists');
      }
      const hashedPin = await this.hashPin('0000');
      const newUser: InMemoryUser = {
        id: nextUserId++,
        email,
        password: hashedPin,
        name,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryUsers.push(newUser);
      logger.info(`Guest user created in memory with id: ${newUser.id}`);
      return newUser.id;
    }
  }

  /**
   * Log audit event (supports both object signature and positional parameters)
   */
  static async logAuditEvent(
    userIdOrPayload: number | { userId: number; action: string; resource?: string; status?: string; details?: any; ipAddress?: string; userAgent?: string },
    actionParam?: string,
    detailsParam?: any,
    ipAddressParam?: string,
    userAgentParam?: string
  ): Promise<void> {
    let userId: number;
    let action: string;
    let details: any;
    let ipAddress: string | undefined;
    let userAgent: string | undefined;

    if (typeof userIdOrPayload === 'object' && userIdOrPayload !== null) {
      userId = userIdOrPayload.userId;
      action = userIdOrPayload.action;
      details = {
        ...(userIdOrPayload.resource && { resource: userIdOrPayload.resource }),
        ...(userIdOrPayload.status && { status: userIdOrPayload.status }),
        ...(userIdOrPayload.details || {}),
      };
      ipAddress = userIdOrPayload.ipAddress;
      userAgent = userIdOrPayload.userAgent;
    } else {
      userId = userIdOrPayload;
      action = actionParam || 'unknown_action';
      details = detailsParam || {};
      ipAddress = ipAddressParam;
      userAgent = userAgentParam;
    }

    try {
      await query(
        `INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [userId, action, JSON.stringify(details), ipAddress, userAgent]
      );
    } catch (error) {
      // In-memory fallback
      inMemoryAuditLogs.push({
        userId,
        action,
        details,
        ipAddress,
        userAgent,
        createdAt: new Date(),
      });
    }
  }

  /**
   * Retrieve in-memory audit logs (useful in tests and verification)
   */
  static getInMemoryAuditLogs(userId?: number): any[] {
    return userId ? inMemoryAuditLogs.filter(a => a.userId === userId) : [...inMemoryAuditLogs];
  }

  /**
    * Create user with PIN
    */
    static async createUserWithPin(email: string, name: string, pin: string, ipAddress?: string, userAgent?: string): Promise<number> {
    if (useInMemory) {
      const existingUser = inMemoryUsers.find(u => u.email === email);
      if (existingUser) {
        throw new Error('User already exists');
      }
      const hashedPin = await this.hashPin(pin);
      const newUser: InMemoryUser = {
        id: nextUserId++,
        email,
        name,
        password: hashedPin,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryUsers.push(newUser);
      return newUser.id;
    }

    try {
      logger.info(`Creating user with email: ${email}, name: ${name}, pin length: ${pin.length}`);
      const hashedPin = await this.hashPin(pin);

      const result = await query(
        `INSERT INTO users (email, name, pin, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING id`,
        [email, name, hashedPin]
      );

      if (result.rows.length > 0) {
        const userId = result.rows[0].id;
        logger.info(`User created successfully with id: ${userId}`);

        // Create default user profile
        try {
          await query(
            `INSERT INTO user_profiles (user_id, monthly_income, monthly_expenses, emergency_fund, savings_rate, experience_years, created_at, updated_at)
             VALUES ($1, 0, 0, 0, 0.0, 30, NOW(), NOW())
             ON CONFLICT (user_id) DO NOTHING`,
            [userId]
          );
          logger.info(`User profile created for user ${userId}`);
        } catch (e) {
          logger.error(`Failed to create user_profile for user ${userId}: ${e}`);
          // Don't fail the registration if profile creation fails
        }
        return userId;
      }
      logger.error('No rows returned after user insert');
      return 0;
    } catch (error: any) {
      logger.error(`Failed to create user with PIN for email ${email}: ${error.message || error}`);
      console.error('Full error:', error);

      // Fallback to in-memory storage
      logger.info('Falling back to in-memory storage');
      useInMemory = true;
      const existingUser = inMemoryUsers.find(u => u.email === email);
      if (existingUser) {
        throw new Error('User already exists');
      }
      const hashedPin = await this.hashPin(pin);
      const newUser: InMemoryUser = {
        id: nextUserId++,
        email,
        name,
        password: hashedPin,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryUsers.push(newUser);
      return newUser.id;
    }
  }



  /**
   * Save asset allocation data
   */
  static async saveAssetAllocation(data: AssetAllocationData): Promise<boolean> {
    try {
      await query(`
        INSERT INTO asset_allocations (
          user_id, sip_percentage, stocks_percentage, bonds_percentage,
          lifestyle_percentage, emergency_fund_percentage, sip_amount,
          stocks_amount, bonds_amount, lifestyle_amount, emergency_amount,
          reasoning, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (user_id)
        DO UPDATE SET
          sip_percentage = EXCLUDED.sip_percentage,
          stocks_percentage = EXCLUDED.stocks_percentage,
          bonds_percentage = EXCLUDED.bonds_percentage,
          lifestyle_percentage = EXCLUDED.lifestyle_percentage,
          emergency_fund_percentage = EXCLUDED.emergency_fund_percentage,
          sip_amount = EXCLUDED.sip_amount,
          stocks_amount = EXCLUDED.stocks_amount,
          bonds_amount = EXCLUDED.bonds_amount,
          lifestyle_amount = EXCLUDED.lifestyle_amount,
          emergency_amount = EXCLUDED.emergency_amount,
          reasoning = EXCLUDED.reasoning,
          updated_at = EXCLUDED.updated_at
      `, [
        data.userId,
        data.sipPercentage,
        data.stocksPercentage,
        data.bondsPercentage,
        data.lifestylePercentage,
        data.emergencyFundPercentage,
        data.sipAmount,
        data.stocksAmount,
        data.bondsAmount,
        data.lifestyleAmount,
        data.emergencyAmount,
        JSON.stringify(data.reasoning),
        data.createdAt,
        data.updatedAt
      ]);

      logger.info(`Saved asset allocation for user ${data.userId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to save asset allocation for user ${data.userId}: ${error}`);
      return false;
    }
  }

  /**
   * Get asset allocation data
   */
  static async getAssetAllocation(userId: number): Promise<AssetAllocationData | null> {
    try {
      const result = await query(`
        SELECT * FROM asset_allocations WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1
      `, [userId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        userId: row.user_id,
        sipPercentage: parseFloat(row.sip_percentage),
        stocksPercentage: parseFloat(row.stocks_percentage),
        bondsPercentage: parseFloat(row.bonds_percentage),
        lifestylePercentage: parseFloat(row.lifestyle_percentage),
        emergencyFundPercentage: parseFloat(row.emergency_fund_percentage),
        sipAmount: parseFloat(row.sip_amount),
        stocksAmount: parseFloat(row.stocks_amount),
        bondsAmount: parseFloat(row.bonds_amount),
        lifestyleAmount: parseFloat(row.lifestyle_amount),
        emergencyAmount: parseFloat(row.emergency_amount),
        reasoning: JSON.parse(row.reasoning || '[]'),
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      };
    } catch (error) {
      logger.error(`Failed to get asset allocation for user ${userId}: ${error}`);
      return null;
    }
  }

  /**
   * Save emergency fund data
   */
  static async saveEmergencyFundData(data: EmergencyFundData): Promise<boolean> {
    try {
      await query(`
        INSERT INTO emergency_fund_monitoring (
          user_id, current_balance, target_months, monthly_burn_rate,
          months_coverage, status, recommended_action, alerts,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (user_id)
        DO UPDATE SET
          current_balance = EXCLUDED.current_balance,
          target_months = EXCLUDED.target_months,
          monthly_burn_rate = EXCLUDED.monthly_burn_rate,
          months_coverage = EXCLUDED.months_coverage,
          status = EXCLUDED.status,
          recommended_action = EXCLUDED.recommended_action,
          alerts = EXCLUDED.alerts,
          updated_at = EXCLUDED.updated_at
      `, [
        data.userId,
        data.currentBalance,
        data.targetMonths,
        data.monthlyBurnRate,
        data.monthsCoverage,
        data.status,
        data.recommendedAction,
        JSON.stringify(data.alerts),
        data.createdAt,
        data.updatedAt
      ]);

      logger.info(`Saved emergency fund data for user ${data.userId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to save emergency fund data for user ${data.userId}: ${error}`);
      return false;
    }
  }

  /**
   * Get emergency fund data
   */
  static async getEmergencyFundData(userId: number): Promise<EmergencyFundData | null> {
    try {
      const result = await query(`
        SELECT * FROM emergency_fund_monitoring WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1
      `, [userId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        userId: row.user_id,
        currentBalance: parseFloat(row.current_balance),
        targetMonths: parseInt(row.target_months),
        monthlyBurnRate: parseFloat(row.monthly_burn_rate),
        monthsCoverage: parseFloat(row.months_coverage),
        status: row.status,
        recommendedAction: row.recommended_action,
        alerts: JSON.parse(row.alerts || '[]'),
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      };
    } catch (error) {
      logger.error(`Failed to get emergency fund data for user ${userId}: ${error}`);
      return null;
    }
  }

  /**
   * Update user financial profile
   */
  static async updateUserFinancialProfile(userId: number, data: Partial<UserFinancialData>): Promise<boolean> {
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.monthlyIncome !== undefined) {
        updates.push(`monthly_income = $${paramIndex++}`);
        values.push(data.monthlyIncome);
      }
      if (data.monthlyExpenses !== undefined) {
        updates.push(`monthly_expenses = $${paramIndex++}`);
        values.push(data.monthlyExpenses);
      }
      if (data.emergencyFund !== undefined) {
        updates.push(`emergency_fund_balance = $${paramIndex++}`);
        values.push(data.emergencyFund);
      }
      if (data.debtAmount !== undefined) {
        updates.push(`total_debt = $${paramIndex++}`);
        values.push(data.debtAmount);
      }
      if (data.age !== undefined) {
        updates.push(`age = $${paramIndex++}`);
        values.push(data.age);
      }
      if (data.riskTolerance !== undefined) {
        updates.push(`risk_tolerance = $${paramIndex++}`);
        values.push(data.riskTolerance);
      }
      if (data.jobStability !== undefined) {
        updates.push(`job_stability_score = $${paramIndex++}`);
        values.push(data.jobStability);
      }

      if (updates.length === 0) {
        return true; // Nothing to update
      }

      updates.push(`updated_at = $${paramIndex++}`);
      values.push(new Date());

      values.push(userId); // Add userId at the end

      const queryText = `
        UPDATE user_profiles
        SET ${updates.join(', ')}
        WHERE user_id = $${paramIndex}
      `;

      await query(queryText, values);
      logger.info(`Updated financial profile for user ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to update financial profile for user ${userId}: ${error}`);
      return false;
    }
  }

  // ==========================================
  // FINFOLIO WALLET & ACCOUNTABILITY METHODS
  // ==========================================

  /**
   * Reset in-memory collections (used primarily in tests)
   */
  static resetInMemoryState(): void {
    inMemoryUsers.length = 0;
    inMemoryWallets.length = 0;
    inMemoryTransactions.length = 0;
    inMemoryPartners.length = 0;
    inMemoryRules.length = 0;
    inMemoryWithdrawals.length = 0;
    inMemoryNotifications.length = 0;
    inMemoryAuditLogs.length = 0;
    nextUserId = 1;
    nextWalletId = 1;
    nextTxId = 1;
    nextPartnerId = 1;
    nextRuleId = 1;
    nextWithdrawalId = 1;
    nextNotificationId = 1;
    useInMemory = false;
  }

  /**
   * Set in-memory mode explicitly (e.g. in testing)
   */
  static setUseInMemory(val: boolean): void {
    useInMemory = val;
  }

  /**
   * Get or initialize a user's wallet
   */
  static async getOrCreateWallet(userId: number, initialBalance: number = 0, currency: string = 'USD'): Promise<Wallet> {
    try {
      const selectResult = await query(
        `SELECT id, user_id, balance, currency, created_at, updated_at FROM wallets WHERE user_id = $1 LIMIT 1`,
        [userId]
      );

      if (selectResult.rows.length > 0) {
        const row = selectResult.rows[0];
        return {
          id: row.id,
          userId: row.user_id,
          balance: parseFloat(row.balance),
          currency: row.currency,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        };
      }

      const insertResult = await query(
        `INSERT INTO wallets (user_id, balance, currency, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
         RETURNING id, user_id, balance, currency, created_at, updated_at`,
        [userId, initialBalance, currency]
      );

      const row = insertResult.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        balance: parseFloat(row.balance),
        currency: row.currency,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    } catch (error) {
      logger.error(`Failed to get or create wallet for user ${userId}: ${error}`);
      // In-memory fallback
      let wallet = inMemoryWallets.find(w => w.userId === userId);
      if (!wallet) {
        wallet = {
          id: nextWalletId++,
          userId,
          balance: initialBalance,
          currency,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemoryWallets.push(wallet);
      }
      return wallet;
    }
  }

  /**
   * Get wallet for user
   */
  static async getWallet(userId: number): Promise<Wallet | null> {
    try {
      const result = await query(
        `SELECT id, user_id, balance, currency, created_at, updated_at FROM wallets WHERE user_id = $1 LIMIT 1`,
        [userId]
      );
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          userId: row.user_id,
          balance: parseFloat(row.balance),
          currency: row.currency,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        };
      }
      return null;
    } catch (error) {
      logger.error(`Failed to get wallet for user ${userId}: ${error}`);
      const wallet = inMemoryWallets.find(w => w.userId === userId);
      return wallet || null;
    }
  }

  /**
   * Update wallet balance with non-negative check
   */
  static async updateWalletBalance(userId: number, newBalance: number): Promise<Wallet> {
    if (newBalance < 0) {
      throw new Error(`Wallet balance cannot be negative: ${newBalance}`);
    }

    try {
      const result = await query(
        `UPDATE wallets
         SET balance = $1, updated_at = NOW()
         WHERE user_id = $2
         RETURNING id, user_id, balance, currency, created_at, updated_at`,
        [newBalance, userId]
      );

      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          userId: row.user_id,
          balance: parseFloat(row.balance),
          currency: row.currency,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        };
      }
      throw new Error(`Wallet for user ${userId} not found`);
    } catch (error: any) {
      logger.error(`Failed to update wallet balance for user ${userId}: ${error.message}`);
      const wallet = inMemoryWallets.find(w => w.userId === userId);
      if (!wallet) {
        throw new Error(`Wallet for user ${userId} not found`);
      }
      wallet.balance = newBalance;
      wallet.updatedAt = new Date();
      return wallet;
    }
  }

  /**
   * Atomically deduct from wallet balance with non-negative check
   */
  static async atomicDeductWalletBalance(userId: number, amount: number): Promise<Wallet> {
    if (amount <= 0) {
      throw new Error(`Deduction amount must be positive: ${amount}`);
    }

    try {
      const result = await query(
        `UPDATE wallets
         SET balance = balance - $1, updated_at = NOW()
         WHERE user_id = $2 AND balance >= $1
         RETURNING id, user_id, balance, currency, created_at, updated_at`,
        [amount, userId]
      );

      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          userId: row.user_id,
          balance: parseFloat(row.balance),
          currency: row.currency,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        };
      }

      // Check if wallet exists or if balance was insufficient
      const check = await query(`SELECT balance FROM wallets WHERE user_id = $1`, [userId]);
      if (check.rows.length === 0) {
        throw new Error(`Wallet for user ${userId} not found`);
      }
      throw new Error(
        `Insufficient funds: current wallet balance is ${parseFloat(check.rows[0].balance)}, requested ${amount}`
      );
    } catch (error: any) {
      if (error.message?.includes('Insufficient')) {
        throw error;
      }
      logger.error(`Failed to atomically deduct wallet balance for user ${userId}: ${error.message}`);
      const wallet = inMemoryWallets.find(w => w.userId === userId);
      if (!wallet) {
        throw new Error(`Wallet for user ${userId} not found`);
      }
      if (wallet.balance < amount) {
        throw new Error(
          `Insufficient funds: current wallet balance is ${wallet.balance}, requested ${amount}`
        );
      }
      wallet.balance = Math.round((wallet.balance - amount) * 100) / 100;
      wallet.updatedAt = new Date();
      return wallet;
    }
  }

  /**
   * Atomically add to wallet balance
   */
  static async atomicAddWalletBalance(userId: number, amount: number): Promise<Wallet> {
    if (amount <= 0) {
      throw new Error(`Deposit amount must be positive: ${amount}`);
    }

    try {
      const result = await query(
        `INSERT INTO wallets (user_id, balance, currency, created_at, updated_at)
         VALUES ($2, $1, 'INR', NOW(), NOW())
         ON CONFLICT (user_id)
         DO UPDATE SET balance = wallets.balance + $1, updated_at = NOW()
         RETURNING id, user_id, balance, currency, created_at, updated_at`,
        [amount, userId]
      );

      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          userId: row.user_id,
          balance: parseFloat(row.balance),
          currency: row.currency,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        };
      }
      throw new Error(`Wallet for user ${userId} not found`);
    } catch (error: any) {
      logger.error(`Failed to atomically add wallet balance for user ${userId}: ${error.message}`);
      let wallet = inMemoryWallets.find(w => w.userId === userId);
      if (!wallet) {
        wallet = {
          id: nextWalletId++,
          userId,
          balance: 0,
          currency: 'INR',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemoryWallets.push(wallet);
      }
      wallet.balance = Math.round((wallet.balance + amount) * 100) / 100;
      wallet.updatedAt = new Date();
      return wallet;
    }
  }

  /**
   * Record a wallet transaction
   */
  static async createWalletTransaction(
    tx: Omit<WalletTransaction, 'id' | 'createdAt'>
  ): Promise<WalletTransaction> {
    try {
      const result = await query(
        `INSERT INTO wallet_transactions (wallet_id, user_id, amount, type, status, category, reason, reference_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         RETURNING id, wallet_id, user_id, amount, type, status, category, reason, reference_id, created_at`,
        [
          tx.walletId,
          tx.userId,
          tx.amount,
          tx.type,
          tx.status,
          tx.category,
          tx.reason || null,
          tx.referenceId || null,
        ]
      );

      const row = result.rows[0];
      return {
        id: row.id,
        walletId: row.wallet_id,
        userId: row.user_id,
        amount: parseFloat(row.amount),
        type: row.type,
        status: row.status,
        category: row.category,
        reason: row.reason || undefined,
        referenceId: row.reference_id || undefined,
        createdAt: new Date(row.created_at),
      };
    } catch (error) {
      logger.error(`Failed to record wallet transaction: ${error}`);
      const newTx: WalletTransaction = {
        id: nextTxId++,
        walletId: tx.walletId,
        userId: tx.userId,
        amount: tx.amount,
        type: tx.type,
        status: tx.status,
        category: tx.category,
        ...(tx.reason !== undefined && { reason: tx.reason }),
        ...(tx.referenceId !== undefined && { referenceId: tx.referenceId }),
        createdAt: new Date(),
      };
      inMemoryTransactions.push(newTx);
      return newTx;
    }
  }

  /**
   * Get wallet transaction history
   */
  static async getWalletTransactions(userId: number, limit: number = 50): Promise<WalletTransaction[]> {
    try {
      const result = await query(
        `SELECT id, wallet_id, user_id, amount, type, status, category, reason, reference_id, created_at
         FROM wallet_transactions
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, limit]
      );

      return result.rows.map((row: any) => ({
        id: row.id,
        walletId: row.wallet_id,
        userId: row.user_id,
        amount: parseFloat(row.amount),
        type: row.type,
        status: row.status,
        category: row.category,
        reason: row.reason || undefined,
        referenceId: row.reference_id || undefined,
        createdAt: new Date(row.created_at),
      }));
    } catch (error) {
      logger.error(`Failed to get wallet transactions for user ${userId}: ${error}`);
      return inMemoryTransactions
        .filter(t => t.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
    }
  }

  /**
   * Create an accountability partner
   */
  static async createAccountabilityPartner(
    partner: Omit<AccountabilityPartner, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<AccountabilityPartner> {
    try {
      const result = await query(
        `INSERT INTO accountability_partners (user_id, name, email, relationship, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING id, user_id, name, email, relationship, status, created_at, updated_at`,
        [partner.userId, partner.name, partner.email, partner.relationship, partner.status]
      );

      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        email: row.email,
        relationship: row.relationship,
        status: row.status,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    } catch (error) {
      logger.error(`Failed to create accountability partner: ${error}`);
      const newPartner: AccountabilityPartner = {
        id: nextPartnerId++,
        userId: partner.userId,
        name: partner.name,
        email: partner.email,
        relationship: partner.relationship,
        status: partner.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryPartners.push(newPartner);
      return newPartner;
    }
  }

  /**
   * Get active accountability partners for user
   */
  static async getAccountabilityPartners(userId: number): Promise<AccountabilityPartner[]> {
    try {
      const result = await query(
        `SELECT id, user_id, name, email, relationship, status, created_at, updated_at
         FROM accountability_partners
         WHERE user_id = $1 AND status != 'inactive'`,
        [userId]
      );

      return result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        email: row.email,
        relationship: row.relationship,
        status: row.status,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }));
    } catch (error) {
      logger.error(`Failed to get accountability partners for user ${userId}: ${error}`);
      return inMemoryPartners.filter(p => p.userId === userId && p.status !== 'inactive');
    }
  }

  /**
   * Create commitment rule
   */
  static async createCommitmentRule(
    rule: Omit<CommitmentRule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CommitmentRule> {
    try {
      const result = await query(
        `INSERT INTO commitment_rules (user_id, category, level, requires_approval, max_instant_amount, partner_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING id, user_id, category, level, requires_approval, max_instant_amount, partner_id, created_at, updated_at`,
        [
          rule.userId,
          rule.category,
          rule.level,
          rule.requiresApproval,
          rule.maxInstantAmount,
          rule.partnerId || null,
        ]
      );

      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        category: row.category,
        level: row.level,
        requiresApproval: row.requires_approval,
        maxInstantAmount: parseFloat(row.max_instant_amount),
        partnerId: row.partner_id || undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    } catch (error) {
      logger.error(`Failed to create commitment rule: ${error}`);
      const newRule: CommitmentRule = {
        id: nextRuleId++,
        userId: rule.userId,
        category: rule.category,
        level: rule.level,
        requiresApproval: rule.requiresApproval,
        maxInstantAmount: rule.maxInstantAmount,
        ...(rule.partnerId !== undefined && { partnerId: rule.partnerId }),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryRules.push(newRule);
      return newRule;
    }
  }

  /**
   * Get commitment rules for user
   */
  static async getCommitmentRules(userId: number): Promise<CommitmentRule[]> {
    try {
      const result = await query(
        `SELECT id, user_id, category, level, requires_approval, max_instant_amount, partner_id, created_at, updated_at
         FROM commitment_rules
         WHERE user_id = $1`,
        [userId]
      );

      return result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        category: row.category,
        level: row.level,
        requiresApproval: row.requires_approval,
        maxInstantAmount: parseFloat(row.max_instant_amount),
        partnerId: row.partner_id || undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }));
    } catch (error) {
      logger.error(`Failed to get commitment rules for user ${userId}: ${error}`);
      return inMemoryRules.filter(r => r.userId === userId);
    }
  }

  /**
   * Create withdrawal request
   */
  static async createWithdrawalRequest(
    req: Omit<WithdrawalRequest, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<WithdrawalRequest> {
    try {
      const result = await query(
        `INSERT INTO withdrawal_requests (
           user_id, wallet_id, goal_id, amount, category, reason, status,
           estimated_delay_days, runway_impact_months, is_emergency, is_override,
           partner_notes, decision_date, created_at, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
         RETURNING *`,
        [
          req.userId,
          req.walletId,
          req.goalId || null,
          req.amount,
          req.category,
          req.reason,
          req.status,
          req.estimatedDelayDays,
          req.runwayImpactMonths,
          req.isEmergency,
          req.isOverride,
          req.partnerNotes || null,
          req.decisionDate || null,
        ]
      );

      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        walletId: row.wallet_id,
        goalId: row.goal_id || undefined,
        amount: parseFloat(row.amount),
        category: row.category,
        reason: row.reason,
        status: row.status,
        estimatedDelayDays: row.estimated_delay_days,
        runwayImpactMonths: parseFloat(row.runway_impact_months),
        isEmergency: row.is_emergency,
        isOverride: row.is_override,
        partnerNotes: row.partner_notes || undefined,
        decisionDate: row.decision_date ? new Date(row.decision_date) : undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    } catch (error) {
      logger.error(`Failed to create withdrawal request: ${error}`);
      const newReq: WithdrawalRequest = {
        id: nextWithdrawalId++,
        userId: req.userId,
        walletId: req.walletId,
        ...(req.goalId !== undefined && { goalId: req.goalId }),
        amount: req.amount,
        category: req.category,
        reason: req.reason,
        status: req.status,
        estimatedDelayDays: req.estimatedDelayDays,
        runwayImpactMonths: req.runwayImpactMonths,
        isEmergency: req.isEmergency,
        isOverride: req.isOverride,
        ...(req.partnerNotes !== undefined && { partnerNotes: req.partnerNotes }),
        ...(req.decisionDate !== undefined && { decisionDate: req.decisionDate }),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryWithdrawals.push(newReq);
      return newReq;
    }
  }

  /**
   * Get withdrawal requests for user
   */
  static async getWithdrawalRequests(userId: number): Promise<WithdrawalRequest[]> {
    try {
      const result = await query(
        `SELECT * FROM withdrawal_requests WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );

      return result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        walletId: row.wallet_id,
        goalId: row.goal_id || undefined,
        amount: parseFloat(row.amount),
        category: row.category,
        reason: row.reason,
        status: row.status,
        estimatedDelayDays: row.estimated_delay_days,
        runwayImpactMonths: parseFloat(row.runway_impact_months),
        isEmergency: row.is_emergency,
        isOverride: row.is_override,
        partnerNotes: row.partner_notes || undefined,
        decisionDate: row.decision_date ? new Date(row.decision_date) : undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }));
    } catch (error) {
      logger.error(`Failed to get withdrawal requests for user ${userId}: ${error}`);
      return inMemoryWithdrawals
        .filter(w => w.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  /**
   * Get accountability partner by ID
   */
  static async getAccountabilityPartnerById(partnerId: number): Promise<AccountabilityPartner | null> {
    try {
      const result = await query(
        `SELECT id, user_id, name, email, relationship, status, created_at, updated_at
         FROM accountability_partners
         WHERE id = $1`,
        [partnerId]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        email: row.email,
        relationship: row.relationship,
        status: row.status,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    } catch (error) {
      logger.error(`Failed to get accountability partner by id ${partnerId}: ${error}`);
      return inMemoryPartners.find(p => p.id === partnerId) || null;
    }
  }

  /**
   * Get accountability partners by partner email (for partner portal lookup)
   */
  static async getAccountabilityPartnersByEmail(email: string): Promise<AccountabilityPartner[]> {
    try {
      const result = await query(
        `SELECT id, user_id, name, email, relationship, status, created_at, updated_at
         FROM accountability_partners
         WHERE LOWER(email) = LOWER($1) AND status != 'inactive'`,
        [email]
      );
      return result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        email: row.email,
        relationship: row.relationship,
        status: row.status,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }));
    } catch (error) {
      logger.error(`Failed to get accountability partners by email ${email}: ${error}`);
      return inMemoryPartners.filter(p => p.email.toLowerCase() === email.toLowerCase() && p.status !== 'inactive');
    }
  }

  /**
   * Update accountability partner status
   */
  static async updateAccountabilityPartnerStatus(
    partnerId: number,
    status: 'pending' | 'active' | 'inactive'
  ): Promise<AccountabilityPartner | null> {
    try {
      const result = await query(
        `UPDATE accountability_partners
         SET status = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING id, user_id, name, email, relationship, status, created_at, updated_at`,
        [status, partnerId]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        email: row.email,
        relationship: row.relationship,
        status: row.status,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    } catch (error) {
      logger.error(`Failed to update accountability partner status ${partnerId}: ${error}`);
      const partner = inMemoryPartners.find(p => p.id === partnerId);
      if (partner) {
        partner.status = status;
        partner.updatedAt = new Date();
        return partner;
      }
      return null;
    }
  }

  /**
   * Delete or permanently deactivate an accountability partner
   */
  static async deleteAccountabilityPartner(partnerId: number, userId: number): Promise<boolean> {
    try {
      const result = await query(
        `DELETE FROM accountability_partners WHERE id = $1 AND user_id = $2`,
        [partnerId, userId]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      logger.error(`Failed to delete accountability partner ${partnerId}: ${error}`);
      const idx = inMemoryPartners.findIndex(p => p.id === partnerId && p.userId === userId);
      if (idx !== -1) {
        inMemoryPartners.splice(idx, 1);
        return true;
      }
      return false;
    }
  }

  /**
   * Get commitment rule by ID
   */
  static async getCommitmentRuleById(ruleId: number): Promise<CommitmentRule | null> {
    try {
      const result = await query(
        `SELECT id, user_id, category, level, requires_approval, max_instant_amount, partner_id, created_at, updated_at
         FROM commitment_rules
         WHERE id = $1`,
        [ruleId]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        category: row.category,
        level: row.level,
        requiresApproval: row.requires_approval,
        maxInstantAmount: parseFloat(row.max_instant_amount),
        partnerId: row.partner_id || undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    } catch (error) {
      logger.error(`Failed to get commitment rule by id ${ruleId}: ${error}`);
      return inMemoryRules.find(r => r.id === ruleId) || null;
    }
  }

  /**
   * Update commitment rule
   */
  static async updateCommitmentRule(
    ruleId: number,
    userId: number,
    updates: Partial<Omit<CommitmentRule, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<CommitmentRule | null> {
    try {
      const current = await this.getCommitmentRuleById(ruleId);
      if (!current || current.userId !== userId) return null;

      const category = updates.category ?? current.category;
      const level = updates.level ?? current.level;
      const requiresApproval = updates.requiresApproval !== undefined ? updates.requiresApproval : current.requiresApproval;
      const maxInstantAmount = updates.maxInstantAmount !== undefined ? updates.maxInstantAmount : current.maxInstantAmount;
      const partnerId = updates.partnerId !== undefined ? updates.partnerId : (current.partnerId ?? null);

      const result = await query(
        `UPDATE commitment_rules
         SET category = $1, level = $2, requires_approval = $3, max_instant_amount = $4, partner_id = $5, updated_at = NOW()
         WHERE id = $6 AND user_id = $7
         RETURNING id, user_id, category, level, requires_approval, max_instant_amount, partner_id, created_at, updated_at`,
        [category, level, requiresApproval, maxInstantAmount, partnerId, ruleId, userId]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        category: row.category,
        level: row.level,
        requiresApproval: row.requires_approval,
        maxInstantAmount: parseFloat(row.max_instant_amount),
        partnerId: row.partner_id || undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    } catch (error) {
      logger.error(`Failed to update commitment rule ${ruleId}: ${error}`);
      const rule = inMemoryRules.find(r => r.id === ruleId && r.userId === userId);
      if (rule) {
        if (updates.category !== undefined) rule.category = updates.category;
        if (updates.level !== undefined) rule.level = updates.level;
        if (updates.requiresApproval !== undefined) rule.requiresApproval = updates.requiresApproval;
        if (updates.maxInstantAmount !== undefined) rule.maxInstantAmount = updates.maxInstantAmount;
        if (updates.partnerId !== undefined) rule.partnerId = updates.partnerId;
        rule.updatedAt = new Date();
        return rule;
      }
      return null;
    }
  }

  /**
   * Delete commitment rule
   */
  static async deleteCommitmentRule(ruleId: number, userId: number): Promise<boolean> {
    try {
      const result = await query(
        `DELETE FROM commitment_rules WHERE id = $1 AND user_id = $2`,
        [ruleId, userId]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      logger.error(`Failed to delete commitment rule ${ruleId}: ${error}`);
      const idx = inMemoryRules.findIndex(r => r.id === ruleId && r.userId === userId);
      if (idx !== -1) {
        inMemoryRules.splice(idx, 1);
        return true;
      }
      return false;
    }
  }

  /**
   * Get withdrawal request by ID
   */
  static async getWithdrawalRequestById(requestId: number): Promise<WithdrawalRequest | null> {
    try {
      const result = await query(
        `SELECT * FROM withdrawal_requests WHERE id = $1`,
        [requestId]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        walletId: row.wallet_id,
        goalId: row.goal_id || undefined,
        amount: parseFloat(row.amount),
        category: row.category,
        reason: row.reason,
        status: row.status,
        estimatedDelayDays: row.estimated_delay_days,
        runwayImpactMonths: parseFloat(row.runway_impact_months),
        isEmergency: row.is_emergency,
        isOverride: row.is_override,
        partnerNotes: row.partner_notes || undefined,
        decisionDate: row.decision_date ? new Date(row.decision_date) : undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    } catch (error) {
      logger.error(`Failed to get withdrawal request by id ${requestId}: ${error}`);
      return inMemoryWithdrawals.find(w => w.id === requestId) || null;
    }
  }

  /**
   * Update withdrawal request status
   */
  static async updateWithdrawalRequestStatus(
    requestId: number,
    status: WithdrawalStatus,
    partnerNotes?: string,
    decisionDate?: Date
  ): Promise<WithdrawalRequest | null> {
    try {
      const result = await query(
        `UPDATE withdrawal_requests
         SET status = $1, partner_notes = COALESCE($2, partner_notes), decision_date = COALESCE($3, decision_date), updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [status, partnerNotes || null, decisionDate || null, requestId]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        walletId: row.wallet_id,
        goalId: row.goal_id || undefined,
        amount: parseFloat(row.amount),
        category: row.category,
        reason: row.reason,
        status: row.status,
        estimatedDelayDays: row.estimated_delay_days,
        runwayImpactMonths: parseFloat(row.runway_impact_months),
        isEmergency: row.is_emergency,
        isOverride: row.is_override,
        partnerNotes: row.partner_notes || undefined,
        decisionDate: row.decision_date ? new Date(row.decision_date) : undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    } catch (error) {
      logger.error(`Failed to update withdrawal request status ${requestId}: ${error}`);
      const req = inMemoryWithdrawals.find(w => w.id === requestId);
      if (req) {
        req.status = status;
        if (partnerNotes !== undefined) req.partnerNotes = partnerNotes;
        if (decisionDate !== undefined) req.decisionDate = decisionDate;
        req.updatedAt = new Date();
        return req;
      }
      return null;
    }
  }

  /**
   * Atomically transition an approved withdrawal request to executed state
   * Prevents race conditions and duplicate executions.
   */
  static async atomicTransitionApprovedToExecuted(
    requestId: number,
    userId: number
  ): Promise<WithdrawalRequest | null> {
    try {
      const result = await query(
        `UPDATE withdrawal_requests
         SET status = 'executed', updated_at = NOW()
         WHERE id = $1 AND user_id = $2 AND status = 'approved'
         RETURNING *`,
        [requestId, userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        walletId: row.wallet_id,
        goalId: row.goal_id || undefined,
        amount: parseFloat(row.amount),
        category: row.category,
        reason: row.reason,
        status: row.status,
        estimatedDelayDays: row.estimated_delay_days,
        runwayImpactMonths: parseFloat(row.runway_impact_months),
        isEmergency: row.is_emergency,
        isOverride: row.is_override,
        partnerNotes: row.partner_notes || undefined,
        decisionDate: row.decision_date ? new Date(row.decision_date) : undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    } catch (error) {
      logger.error(
        `Failed to atomically transition withdrawal request ${requestId} to executed: ${error}`
      );
      const req = inMemoryWithdrawals.find(
        w => w.id === requestId && w.userId === userId && w.status === 'approved'
      );
      if (req) {
        req.status = 'executed';
        req.updatedAt = new Date();
        return req;
      }
      return null;
    }
  }

  /**
   * Get pending withdrawal requests for a partner email
   * Strictly isolates to active partner assignments and pending status.
   */
  static async getPendingRequestsForPartnerEmail(partnerEmail: string): Promise<WithdrawalRequest[]> {
    const trimmedEmail = partnerEmail.trim().toLowerCase();
    try {
      const result = await query(
        `SELECT wr.*
         FROM withdrawal_requests wr
         JOIN commitment_rules cr ON wr.user_id = cr.user_id AND LOWER(TRIM(wr.category)) = LOWER(TRIM(cr.category))
         JOIN accountability_partners ap ON cr.partner_id = ap.id
         WHERE LOWER(TRIM(ap.email)) = LOWER($1) AND ap.status = 'active' AND wr.status = 'pending'
         ORDER BY wr.created_at DESC`,
        [trimmedEmail]
      );

      return result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        walletId: row.wallet_id,
        goalId: row.goal_id || undefined,
        amount: parseFloat(row.amount),
        category: row.category,
        reason: row.reason,
        status: row.status,
        estimatedDelayDays: row.estimated_delay_days,
        runwayImpactMonths: parseFloat(row.runway_impact_months),
        isEmergency: row.is_emergency,
        isOverride: row.is_override,
        partnerNotes: row.partner_notes || undefined,
        decisionDate: row.decision_date ? new Date(row.decision_date) : undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }));
    } catch (error) {
      logger.error(`Failed to get pending requests for partner email ${partnerEmail}: ${error}`);
      // In-memory fallback with strict category, partner ID, and pending status matching
      const activePartners = inMemoryPartners.filter(
        p => p.email.trim().toLowerCase() === trimmedEmail && p.status === 'active'
      );
      const activePartnerIds = new Set(activePartners.map(p => p.id));

      const matchingRules = inMemoryRules.filter(
        r => r.partnerId !== undefined && r.partnerId !== null && activePartnerIds.has(r.partnerId)
      );

      return inMemoryWithdrawals
        .filter(w => {
          if (w.status !== 'pending') return false;
          return matchingRules.some(
            r =>
              r.userId === w.userId &&
              r.category.trim().toLowerCase() === w.category.trim().toLowerCase()
          );
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  /**
   * Create partner notification (emergency alerts, review notifications)
   */
  static async createPartnerNotification(data: {
    userId: number;
    partnerId?: number | null | undefined;
    partnerEmail: string;
    type: any;
    title: string;
    message: string;
    details?: Record<string, any> | undefined;
  }): Promise<PartnerNotification> {
    try {
      const result = await query(
        `INSERT INTO partner_notifications (user_id, partner_id, partner_email, type, title, message, details, read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, false, NOW())
         RETURNING id, user_id, partner_id, partner_email, type, title, message, details, read, created_at`,
        [
          data.userId,
          data.partnerId || null,
          data.partnerEmail,
          data.type,
          data.title,
          data.message,
          JSON.stringify(data.details || {}),
        ]
      );

      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        partnerId: row.partner_id || undefined,
        partnerEmail: row.partner_email,
        type: row.type,
        title: row.title,
        message: row.message,
        details: row.details,
        read: row.read,
        createdAt: new Date(row.created_at),
      };
    } catch (error) {
      logger.error(`Failed to create partner notification: ${error}`);
      const newNotif: PartnerNotification = {
        id: nextNotificationId++,
        userId: data.userId,
        ...(data.partnerId !== undefined && { partnerId: data.partnerId }),
        partnerEmail: data.partnerEmail,
        type: data.type,
        title: data.title,
        message: data.message,
        ...(data.details !== undefined && { details: data.details }),
        read: false,
        createdAt: new Date(),
      };
      inMemoryNotifications.push(newNotif);
      return newNotif;
    }
  }

  /**
   * Get partner notifications by user or partner email
   */
  static async getPartnerNotifications(
    userId?: number,
    partnerEmail?: string
  ): Promise<PartnerNotification[]> {
    try {
      let queryText = `SELECT * FROM partner_notifications WHERE 1=1`;
      const params: any[] = [];
      let paramIdx = 1;

      if (userId !== undefined) {
        queryText += ` AND user_id = $${paramIdx++}`;
        params.push(userId);
      }
      if (partnerEmail) {
        queryText += ` AND LOWER(partner_email) = LOWER($${paramIdx++})`;
        params.push(partnerEmail);
      }

      queryText += ` ORDER BY created_at DESC`;

      const result = await query(queryText, params);
      return result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        partnerId: row.partner_id || undefined,
        partnerEmail: row.partner_email,
        type: row.type,
        title: row.title,
        message: row.message,
        details: row.details,
        read: row.read,
        createdAt: new Date(row.created_at),
      }));
    } catch (error) {
      logger.error(`Failed to get partner notifications: ${error}`);
      return inMemoryNotifications
        .filter(n => {
          if (userId !== undefined && n.userId !== userId) return false;
          if (partnerEmail && n.partnerEmail.toLowerCase() !== partnerEmail.toLowerCase()) return false;
          return true;
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  /**
   * Mark partner notification as read
   */
  static async markPartnerNotificationRead(notificationId: number): Promise<boolean> {
    try {
      const result = await query(
        `UPDATE partner_notifications SET read = true WHERE id = $1`,
        [notificationId]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      logger.error(`Failed to mark notification as read: ${error}`);
      const notif = inMemoryNotifications.find(n => n.id === notificationId);
      if (notif) {
        notif.read = true;
        return true;
      }
      return false;
    }
  }

  /**
   * Get emergency withdrawals for user
   */
  static async getEmergencyWithdrawals(userId: number, days?: number): Promise<WithdrawalRequest[]> {
    try {
      let queryText = `SELECT * FROM withdrawal_requests WHERE user_id = $1 AND is_emergency = true`;
      const params: any[] = [userId];

      if (days !== undefined) {
        queryText += ` AND created_at >= NOW() - INTERVAL '1 day' * $2`;
        params.push(days);
      }

      queryText += ` ORDER BY created_at DESC`;

      const result = await query(queryText, params);
      return result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        walletId: row.wallet_id,
        goalId: row.goal_id || undefined,
        amount: parseFloat(row.amount),
        category: row.category,
        reason: row.reason,
        status: row.status,
        estimatedDelayDays: row.estimated_delay_days,
        runwayImpactMonths: parseFloat(row.runway_impact_months),
        isEmergency: row.is_emergency,
        isOverride: row.is_override,
        partnerNotes: row.partner_notes || undefined,
        decisionDate: row.decision_date ? new Date(row.decision_date) : undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }));
    } catch (error) {
      logger.error(`Failed to get emergency withdrawals: ${error}`);
      const cutoff = days !== undefined ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;
      return inMemoryWithdrawals
        .filter(w => w.userId === userId && w.isEmergency && (!cutoff || w.createdAt >= cutoff))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }
}