import { Pool } from 'pg';
import { config } from './env';
import { logger } from '../utils/logger';

// TODO: Replace with Prisma or TypeORM client
export const db = new Pool({
  connectionString: config.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

db.on('error', (err) => {
  logger.error(`Unexpected error on idle client: ${err.message}`);
});

// Example query function with better error handling
export const query = async (text: string, params?: any[]) => {
  try {
    const res = await db.query(text, params);
    return res;
  } catch (error: any) {
    logger.error(`Database query error: ${error.message} (Code: ${error.code})`);
    if (error.code === '28P01') {
      logger.error('Database authentication failed. Please check your database credentials in the .env file.');
    }
    throw error;
  }
};