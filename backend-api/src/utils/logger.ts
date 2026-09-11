import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';

const logsDir = path.join(process.cwd(), 'logs');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const getTimestamp = (): string => {
  return new Date().toISOString();
};

const sanitizeData = (data: unknown): unknown => {
  if (typeof data === 'object' && data !== null) {
    const sanitized = { ...data } as Record<string, unknown>;
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'authorization', 'apiKey', 'secret'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    return sanitized;
  }
  return data;
};

const formatMessage = (level: string, data: unknown, requestId?: string): string => {
  const timestamp = getTimestamp();
  const logEntry = {
    timestamp,
    level: level.toLowerCase(),
    message: typeof data === 'string' ? data : sanitizeData(data),
    ...(requestId && { requestId }),
  };
  return JSON.stringify(logEntry);
};

const writeLog = (level: string, data: unknown, requestId?: string): void => {
  const message = formatMessage(level, data, requestId);
  const logFile = path.join(logsDir, `${level.toLowerCase()}.log`);
  const allLogsFile = path.join(logsDir, 'all.log');

  // Write to level-specific file
  fs.appendFileSync(logFile, message + '\n', { encoding: 'utf8' });
  // Write to all logs file
  fs.appendFileSync(allLogsFile, message + '\n', { encoding: 'utf8' });
  // Also log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(message);
  }
};

export const logger = {
  info: (message: string | object, requestId?: string) => {
    writeLog('INFO', message, requestId);
  },
  error: (message: string | object, requestId?: string) => {
    writeLog('ERROR', message, requestId);
  },
  warn: (message: string | object, requestId?: string) => {
    writeLog('WARN', message, requestId);
  },
  debug: (message: string | object, requestId?: string) => {
    if (process.env.NODE_ENV === 'development') {
      writeLog('DEBUG', message, requestId);
    }
  },
};

// Middleware to add request ID
export interface RequestWithId extends Request {
  requestId?: string;
}

export const requestIdMiddleware = (req: RequestWithId, _res: Response, next: NextFunction) => {
  req.requestId = uuidv4();
  next();
};