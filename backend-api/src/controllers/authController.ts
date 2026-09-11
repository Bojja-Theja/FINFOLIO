import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { DatabaseService } from '../services/databaseService';

export const verify = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization as string | undefined;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Invalid token format' });

    const decoded = jwt.verify(token, config.jwtSecret);
    return res.json({ valid: true, payload: decoded });
  } catch (err: any) {
    return res.status(401).json({ valid: false, error: err.message || 'Unauthorized' });
  }
};

export const guestLogin = async (req: Request, res: Response) => {
  try {
    // Generate unique guest ID
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const guestEmail = `${guestId}@guest.capstack.local`;
    const guestName = 'Guest User';

    // Create temporary guest user with default PIN
    const userId = await DatabaseService.createGuestUser(guestEmail, guestName);

    if (!userId || userId === 0) {
      return res.status(500).json({ error: 'Failed to create guest session' });
    }

    // Sign token
    const token = jwt.sign(
      { userId, email: guestEmail, name: guestName, isGuest: true },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: { id: userId.toString(), email: guestEmail, name: guestName, isGuest: true }
    });
  } catch (error: any) {
    console.error('Guest login error:', error);
    return res.status(500).json({ error: 'Failed to create guest session' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, pin } = req.body;

    if (!email || !pin) {
      return res.status(400).json({ error: 'Email and PIN are required' });
    }

    // Validate PIN is 4 digits
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
    }

    // Get user by email and pin
    const user = await DatabaseService.getUserByEmailAndPin(email, pin);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or PIN' });
    }

    // Sign token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, isGuest: false },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: { id: user.id.toString(), email: user.email, name: user.name, isGuest: false }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, pin, name } = req.body;

    if (!email || !pin || !name) {
      return res.status(400).json({ error: 'Email, PIN, and name are required' });
    }

    // Validate PIN is 4 digits
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
    }

    // Check if user already exists
    const existingUser = await DatabaseService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user with PIN
    const userId = await DatabaseService.createUserWithPin(email, name, pin);

    if (!userId || userId === 0) {
      console.error('Failed to create user - userId is 0 or null');
      return res.status(500).json({ error: 'Failed to create user account. Please try again.' });
    }

    const token = jwt.sign(
      { userId, email, name, isGuest: false },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'User registered successfully',
      token,
      user: { id: userId.toString(), email, name, isGuest: false }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({
      error: 'Registration failed. Please try again.',
      details: error.message
    });
  }
};