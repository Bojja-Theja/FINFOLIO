import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load from local backend directory and root directory
dotenv.config();
dotenv.config({ path: join(__dirname, '../../.env') });
dotenv.config({ path: join(__dirname, '../../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'finfolio_testing_secret_key_non_prod_only' : ''),
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  redisPassword: process.env.REDIS_PASSWORD || '',
  sentryDsn: process.env.SENTRY_DSN,
};

// Fail fast in production if required environment variables are absent
if (process.env.NODE_ENV === 'production') {
  if (!config.databaseUrl) {
    throw new Error('FATAL: DATABASE_URL environment variable is mandatory for production operations.');
  }
  if (!config.jwtSecret) {
    throw new Error('FATAL: JWT_SECRET environment variable is mandatory for production operations.');
  }
}