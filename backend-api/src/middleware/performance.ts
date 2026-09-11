import { Request, Response, NextFunction } from 'express';

interface PerformanceMetrics {
    path: string;
    method: string;
    statusCode: number;
    responseTime: number;
    timestamp: Date;
    userAgent?: string;
    ip?: string;
}

class PerformanceMonitor {
    private metrics: PerformanceMetrics[] = [];
    private slowQueryThreshold: number = 100; // ms
    private maxMetricsSize: number = 1000;

    logMetric(metric: PerformanceMetrics): void {
        this.metrics.push(metric);

        // Keep only the last N metrics to prevent memory issues
        if (this.metrics.length > this.maxMetricsSize) {
            this.metrics.shift();
        }

        // Log slow requests
        if (metric.responseTime > this.slowQueryThreshold) {
            console.warn(`[SLOW REQUEST] ${metric.method} ${metric.path} - ${metric.responseTime}ms`);
        }
    }

    getMetrics(): PerformanceMetrics[] {
        return this.metrics;
    }

    getAverageResponseTime(): number {
        if (this.metrics.length === 0) return 0;
        const total = this.metrics.reduce((sum, m) => sum + m.responseTime, 0);
        return total / this.metrics.length;
    }

    getSlowestRequests(limit: number = 10): PerformanceMetrics[] {
        return [...this.metrics]
            .sort((a, b) => b.responseTime - a.responseTime)
            .slice(0, limit);
    }

    getMetricsByPath(path: string): PerformanceMetrics[] {
        return this.metrics.filter(m => m.path === path);
    }

    clearMetrics(): void {
        this.metrics = [];
    }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance monitoring middleware
 * Tracks request/response times and logs slow queries
 */
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Capture the original end function
    const originalEnd = res.end;

    // Override res.end to capture response time
    const customEnd: any = function (this: Response, ...args: any[]): Response {
        const responseTime = Date.now() - startTime;

        // Log the metric
        performanceMonitor.logMetric({
            path: req.path,
            method: req.method,
            statusCode: res.statusCode,
            responseTime,
            timestamp: new Date(),
            userAgent: req.get('user-agent'),
            ip: req.ip,
        });

        // Add performance headers
        res.setHeader('X-Response-Time', `${responseTime}ms`);
        res.setHeader('X-Request-ID', req.get('x-request-id') || 'unknown');

        // Call the original end function
        return (originalEnd as any).apply(this, args);
    };

    res.end = customEnd;

    next();
};

/**
 * Request timing middleware
 * Adds timing information to request object
 */
export const requestTimingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    (req as any).startTime = Date.now();

    // Add a helper function to get elapsed time
    (req as any).getElapsedTime = () => {
        return Date.now() - (req as any).startTime;
    };

    next();
};

/**
 * Cache control middleware
 * Sets appropriate cache headers for different routes
 */
export const cacheControlMiddleware = (maxAge: number = 300) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'GET') {
            res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
        } else {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        }
        next();
    };
};

/**
 * API metrics endpoint handler
 */
export const getPerformanceMetrics = (req: Request, res: Response) => {
    const metrics = performanceMonitor.getMetrics();
    const averageResponseTime = performanceMonitor.getAverageResponseTime();
    const slowestRequests = performanceMonitor.getSlowestRequests(10);

    res.json({
        totalRequests: metrics.length,
        averageResponseTime: Math.round(averageResponseTime),
        slowestRequests: slowestRequests.map(m => ({
            path: m.path,
            method: m.method,
            responseTime: m.responseTime,
            timestamp: m.timestamp,
        })),
        recentMetrics: metrics.slice(-20).map(m => ({
            path: m.path,
            method: m.method,
            statusCode: m.statusCode,
            responseTime: m.responseTime,
            timestamp: m.timestamp,
        })),
    });
};

export default performanceMiddleware;
