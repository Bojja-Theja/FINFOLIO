import express from "express";
import { Router } from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as Sentry from "@sentry/node";
import authRoutes from "./routes/authRoutes.js";
import financeRoutes from "./routes/financeRoutes.js";
import savingsRoutes from "./routes/savingsRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { logger, requestIdMiddleware } from "./utils/logger.js";
import { metricsMiddleware, getMetrics } from "./utils/metrics.js";
import { config } from "./config/env.js";
import { optionalAuthMiddleware } from "./middleware/optionalAuthMiddleware.js";
import { getBenchmark } from "./controllers/financeController.js";
import { compressionMiddleware } from "./middleware/compression.js";
import { performanceMiddleware, getPerformanceMetrics } from "./middleware/performance.js";
import { cacheService } from "./config/cache.js";
import insightsRoutes from "./routes/insightsRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import accountabilityRoutes from "./routes/accountabilityRoutes.js";
import withdrawalRoutes from "./routes/withdrawalRoutes.js";

dotenv.config();

// Initialize Sentry
if (config.sentryDsn) {
  Sentry.init({
    dsn: config.sentryDsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
  });
}

const app = express();
const PORT = process.env.PORT || 3001;

// ----------------------------------
// ⭐ CORS Configuration
// ----------------------------------
// ⭐ CORS Configuration
// ----------------------------------
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "https://finfolio-frontend.onrender.com",
  "https://finfolio.onrender.com",
  // Add environment variable support for custom deployment URLs
  process.env.FRONTEND_URL || "",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || allowedOrigins.includes(origin?.replace(/\/$/, ""))) {
        callback(null, true);
      } else {
        // In development, be lenient
        if (process.env.NODE_ENV === 'development') {
          logger.warn(`CORS: Allowing origin in development mode: ${origin}`);
          return callback(null, true);
        }
        logger.warn(`CORS rejected origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200,
    maxAge: 86400, // 24 hours
  })
);

// Allow preflight
app.options("*", cors());

// ----------------------------------
// Performance Middleware
// ----------------------------------
// Compression should be early in the middleware chain
app.use(compressionMiddleware);

// Performance monitoring
app.use(performanceMiddleware);

// ----------------------------------
// Middleware
// ----------------------------------

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Request ID middleware
app.use(requestIdMiddleware);

// Metrics middleware
app.use(metricsMiddleware);

// Request logging middleware
app.use((req: any, res: any, next: any) => {
  logger.info(`${req.method} ${req.originalUrl}`, req.requestId);
  next();
});

// ----------------------------------
// Health Check
// ----------------------------------
app.get("/health", async (req, res) => {
  let dbStatus = "unknown";
  let dbLatency = 0;
  let mlStatus = "unknown";

  try {
    const { db } = await import('./config/db.js');
    const dbStart = Date.now();
    await db.query('SELECT 1');
    dbLatency = Date.now() - dbStart;
    dbStatus = "connected";
  } catch (dbErr: any) {
    dbStatus = "disconnected";
  }

  try {
    const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const mlRes = await fetch(`${mlUrl}/health`, { signal: AbortSignal.timeout(1500) });
    mlStatus = mlRes.ok ? "connected" : "degraded";
  } catch {
    mlStatus = "unavailable";
  }

  const isHealthy = dbStatus === "connected";
  const isTest = process.env.NODE_ENV === 'test';

  res.status(isHealthy || isTest ? 200 : 503).json({
    status: isHealthy || isTest ? "ok" : "error",
    overallStatus: isHealthy ? (mlStatus === "connected" ? "ok" : "degraded") : "error",
    message: "Backend API running successfully",
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || "1.0.0",
    services: {
      database: {
        status: dbStatus,
        latencyMs: dbLatency,
        type: "PostgreSQL"
      },
      redis: {
        status: cacheService.getIsConnected() ? "connected" : (process.env.REDIS_ENABLED === "true" ? "available" : "disabled")
      },
      mlService: {
        status: mlStatus,
        url: process.env.ML_SERVICE_URL || 'http://localhost:8000'
      }
    }
  });
});

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  try {
    const metrics = await getMetrics();
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(metrics);
  } catch (error) {
    res.status(500).send('Error generating metrics');
  }
});

// ----------------------------------
// Routes
// ----------------------------------
app.use("/auth", authRoutes);
app.use("/finance", financeRoutes);
app.use("/savings", savingsRoutes);
app.use("/user", userRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/goals", goalRoutes);
app.use("/goals", goalRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/wallet", walletRoutes);
app.use("/api/accountability", accountabilityRoutes);
app.use("/accountability", accountabilityRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/withdrawals", withdrawalRoutes);
app.use("/api/wallet/withdrawals", withdrawalRoutes);

// ----------------------------------
// API Aliases (compat with frontend paths)
// ----------------------------------
const apiRouter = Router();
// Alias: /api/benchmarking -> /finance/benchmark
apiRouter.get("/benchmarking", optionalAuthMiddleware, getBenchmark);
app.use("/api", apiRouter);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "FINFOLIO Backend API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/health",
      auth: "/auth",
      finance: "/finance",
      savings: "/savings",
      user: "/user",
      metrics: "/api/metrics/performance",
    },
  });
});

// Performance metrics endpoint
app.get("/api/metrics/performance", getPerformanceMetrics);

// ----------------------------------
// Error Handling
// ----------------------------------
// 404 handler - must be after all other routes
app.use(notFoundHandler);

// Error handler - must be last
app.use(errorHandler);

// Sentry error handler - must be after all other error handlers
if (config.sentryDsn) {
  Sentry.setupExpressErrorHandler(app);
}

// ----------------------------------
// Server Startup
// ----------------------------------
let server: any;
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    try {
      if (process.env.REDIS_ENABLED === 'true') {
        await cacheService.connect();
        logger.info('✅ Redis cache connected');
      } else {
        logger.info('ℹ️  Redis cache disabled');
      }
    } catch (error) {
      logger.warn('⚠️  Redis connection failed, running without cache');
      logger.warn(`Redis error: ${error}`);
    }
  })();

  server = app.listen(PORT, () => {
    logger.info(`✅ Server running on port ${PORT}`);
    logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🌍 Allowed origins: ${allowedOrigins.join(', ')}`);
    logger.info(`⚡ Performance monitoring enabled`);
    logger.info(`🗜️  Response compression enabled`);
  });
}

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.warn("SIGTERM received, shutting down gracefully");
  if (server) {
    server.close(async () => {
      try {
        await cacheService.disconnect();
        logger.info("Redis disconnected");
      } catch (error) {
        logger.warn("Error disconnecting Redis");
      }
      logger.info("Server shut down");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on("SIGINT", () => {
  logger.warn("SIGINT received, shutting down gracefully");
  if (server) {
    server.close(async () => {
      try {
        await cacheService.disconnect();
        logger.info("Redis disconnected");
      } catch (error) {
        logger.warn("Error disconnecting Redis");
      }
      logger.info("Server shut down");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
  logger.error({
    message: "Unhandled Rejection",
    reason,
    promise,
  });
});

export default app;
