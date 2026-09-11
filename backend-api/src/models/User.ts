import { query } from '../config/db';
import { logger } from '../utils/logger';

export interface User {
  id: number;
  email: string | null; // Allow null for guest users
  pin: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  isGuest?: boolean; // Optional flag for guest users
}

export const createUser = async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User | null> => {
  try {
    const result = await query(`
      INSERT INTO users (email, password, name, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, password, name, created_at, updated_at
    `, [user.email, user.pin, user.name, new Date(), new Date()]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      pin: row.password,
      name: row.name,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  } catch (error) {
    logger.error(`Failed to create user: ${error}`);
    return null;
  }
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const result = await query(`
      SELECT id, email, password, name, created_at, updated_at
      FROM users
      WHERE email = $1
    `, [email]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      pin: row.password,
      name: row.name,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  } catch (error) {
    logger.error(`Failed to find user by email: ${error}`);
    return null;
  }
};
