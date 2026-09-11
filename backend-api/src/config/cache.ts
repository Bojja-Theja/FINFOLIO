import { createClient, RedisClientType } from 'redis';

interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  ttl: {
    default: number;
    session: number;
    healthScore: number;
    transactions: number;
    analytics: number;
    mlPredictions: number;
  };
}

class CacheService {
  private client: RedisClientType | null = null;
  private config: CacheConfig;
  private isConnected: boolean = false;

  constructor() {
    this.config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      ttl: {
        default: 300, // 5 minutes
        session: 900, // 15 minutes
        healthScore: 300, // 5 minutes
        transactions: 120, // 2 minutes
        analytics: 600, // 10 minutes
        mlPredictions: 1800, // 30 minutes
      },
    };
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      this.client = createClient({
        socket: {
          host: this.config.host,
          port: this.config.port,
        },
        password: this.config.password,
        database: this.config.db,
      });

      this.client.on('error', (err: any) => {
        console.error('Redis Client Error:', err);
      });

      this.client.on('connect', () => {
        console.log('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('Redis Client Disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      // Gracefully handle Redis connection failure - app should work without cache
      this.client = null;
      this.isConnected = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  private getCacheKey(prefix: string, key: string): string {
    return `capstack:${prefix}:${key}`;
  }

  async get<T>(prefix: string, key: string): Promise<T | null> {
    if (!this.client || !this.isConnected) {
      return null;
    }

    try {
      const cacheKey = this.getCacheKey(prefix, key);
      const value = await this.client.get(cacheKey);

      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(prefix: string, key: string, value: any, ttl?: number): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const cacheKey = this.getCacheKey(prefix, key);
      const serializedValue = JSON.stringify(value);
      const cacheTTL = ttl || this.config.ttl.default;

      await this.client.setEx(cacheKey, cacheTTL, serializedValue);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async delete(prefix: string, key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const cacheKey = this.getCacheKey(prefix, key);
      await this.client.del(cacheKey);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async deletePattern(pattern: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const keys = await this.client.keys(`capstack:${pattern}`);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return false;
    }
  }

  async invalidateUser(userId: number): Promise<void> {
    // Invalidate all user-related caches
    await this.deletePattern(`user:${userId}:*`);
    await this.deletePattern(`healthScore:${userId}:*`);
    await this.deletePattern(`transactions:${userId}:*`);
    await this.deletePattern(`analytics:${userId}:*`);
  }

  async getOrSet<T>(
    prefix: string,
    key: string,
    fetchFunction: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cachedValue = await this.get<T>(prefix, key);

    if (cachedValue !== null) {
      return cachedValue;
    }

    // If not in cache, fetch and store
    const value = await fetchFunction();
    await this.set(prefix, key, value, ttl);

    return value;
  }

  async exists(prefix: string, key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const cacheKey = this.getCacheKey(prefix, key);
      const result = await this.client.exists(cacheKey);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  async increment(prefix: string, key: string, amount: number = 1): Promise<number> {
    if (!this.client || !this.isConnected) {
      return 0;
    }

    try {
      const cacheKey = this.getCacheKey(prefix, key);
      return await this.client.incrBy(cacheKey, amount);
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  async getStats(): Promise<any> {
    if (!this.client || !this.isConnected) {
      return { connected: false };
    }

    try {
      const info = await this.client.info('stats');
      return {
        connected: this.isConnected,
        info,
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { connected: false, error };
    }
  }

  getTTL(type: keyof CacheConfig['ttl']): number {
    return this.config.ttl[type];
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Helper functions for specific cache types
export const userCache = {
  get: (userId: number) => cacheService.get('user', userId.toString()),
  set: (userId: number, data: any) =>
    cacheService.set('user', userId.toString(), data, cacheService.getTTL('default')),
  invalidate: (userId: number) => cacheService.delete('user', userId.toString()),
};

export const healthScoreCache = {
  get: (userId: number) => cacheService.get('healthScore', userId.toString()),
  set: (userId: number, score: any) =>
    cacheService.set('healthScore', userId.toString(), score, cacheService.getTTL('healthScore')),
  invalidate: (userId: number) => cacheService.delete('healthScore', userId.toString()),
};

export const transactionsCache = {
  get: (userId: number, page: number = 1) =>
    cacheService.get('transactions', `${userId}:page:${page}`),
  set: (userId: number, page: number, data: any) =>
    cacheService.set('transactions', `${userId}:page:${page}`, data, cacheService.getTTL('transactions')),
  invalidate: (userId: number) => cacheService.deletePattern(`transactions:${userId}:*`),
};

export const analyticsCache = {
  get: (userId: number, type: string) =>
    cacheService.get('analytics', `${userId}:${type}`),
  set: (userId: number, type: string, data: any) =>
    cacheService.set('analytics', `${userId}:${type}`, data, cacheService.getTTL('analytics')),
  invalidate: (userId: number) => cacheService.deletePattern(`analytics:${userId}:*`),
};

export const mlPredictionCache = {
  get: (userId: number, type: string) =>
    cacheService.get('mlPrediction', `${userId}:${type}`),
  set: (userId: number, type: string, data: any) =>
    cacheService.set('mlPrediction', `${userId}:${type}`, data, cacheService.getTTL('mlPredictions')),
  invalidate: (userId: number) => cacheService.deletePattern(`mlPrediction:${userId}:*`),
};

// Legacy export for backward compatibility
export const cache = {
  set: (key: string, value: any, ttl?: number) => {
    cacheService.set('legacy', key, value, ttl);
  },
  get: (key: string) => {
    return cacheService.get('legacy', key);
  },
  delete: (key: string) => {
    return cacheService.delete('legacy', key);
  }
};

export default cacheService;