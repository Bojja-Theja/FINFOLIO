import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { config } from "../config/env";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  isGuest?: boolean;
  user?: {
    id: string;
    email: string | null;
    name: string;
    isGuest?: boolean;
  };
}

/**
 * Optional authentication middleware
 * Allows guest access for basic features, but requires full auth for advanced features
 */
export const optionalAuthMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Allow preflight requests to pass
    if (req.method === "OPTIONS") {
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // No token provided - allow as guest
      req.isGuest = true;
      req.userId = undefined;
      req.user = undefined;
      return next();
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      // Invalid token format - allow as guest
      req.isGuest = true;
      req.userId = undefined;
      req.user = undefined;
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      const userId = decoded.userId;

      // Verify user exists in database (optional check for optional middleware)
      const { query } = await import('../config/db');
      const userResult = await query('SELECT id FROM users WHERE id = $1', [userId]);

      if (userResult.rows.length > 0) {
        req.userId = userId;
        req.isGuest = decoded.isGuest || false;
        req.user = {
          id: userId.toString() || "",
          email: decoded.email || null,
          name: decoded.name || "",
          isGuest: decoded.isGuest || false
        };
      } else {
        // User in token doesn't exist - treat as guest
        req.isGuest = true;
        req.userId = undefined;
        req.user = undefined;
      }
    } catch (tokenError) {
      // Invalid token - allow as guest
      req.isGuest = true;
      req.userId = undefined;
      req.user = undefined;
    }

    next();
  } catch (err) {
    // On any error, allow as guest
    req.isGuest = true;
    req.userId = undefined;
    req.user = undefined;
    next();
  }
};

/**
 * Middleware that requires full authentication (no guest access)
 * Use this for advanced features that require account creation
 */
export const requireAuthMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Allow preflight requests to pass
    if (req.method === "OPTIONS") {
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Authentication required for this feature. Please create an account." });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as any;
    const userId = decoded.userId;

    // Check if this is a guest token
    if (decoded.isGuest) {
      return res.status(403).json({
        error: "This feature requires a full account. Please register with your email to access advanced features.",
        requiresRegistration: true
      });
    }

    // Verify user exists in database (prevents errors after DB reset)
    const { query } = await import('../config/db');
    const userResult = await query('SELECT id FROM users WHERE id = $1', [userId]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Session expired or user not found. Please log in again." });
    }

    req.userId = userId;
    req.isGuest = false;
    req.user = {
      id: decoded.userId?.toString() || "",
      email: decoded.email || "",
      name: decoded.name || "",
      isGuest: false
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Authentication required for this feature. Please create an account." });
  }
};