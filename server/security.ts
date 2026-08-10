import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'hackverse_enterprise_super_secret_jwt_key_2026_x89!';
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 12;
const OTP_SALT = process.env.OTP_SALT || 'HV_SECURE_OTP_SALT_2026_x99';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  emailVerified: boolean;
}

// 1. Password Hashing (Bcrypt 12 rounds)
export async function hashPassword(plainText: string): Promise<string> {
  if (!plainText || plainText.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plainText, salt);
}

export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  if (!plainText || !hash) return false;
  return bcrypt.compare(plainText, hash);
}

// 2. Secure OTP Hashing & Generation
export function hashOtp(otp: string): string {
  return crypto
    .createHash('sha256')
    .update(otp.trim() + OTP_SALT)
    .digest('hex');
}

export function generate6DigitOTP(): string {
  // Cryptographically secure 6-digit random integer
  return crypto.randomInt(100000, 1000000).toString();
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// 3. JWT Tokens
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// 4. Rate Limiting Middleware
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function rateLimiter(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const key = `${ip}:${req.path}`;
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxAttempts) {
      const remainingSeconds = Math.ceil((record.resetTime - now) / 1000);
      return res.status(429).json({
        error: `Too many requests. Please try again in ${remainingSeconds} seconds.`,
      });
    }

    record.count += 1;
    rateLimitStore.set(key, record);
    next();
  };
}

// 5. Authentication Guard Middleware
export function authenticateToken(req: Request & { user?: TokenPayload }, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Unauthenticated request.' });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired authentication session.' });
  }

  if (!decoded.emailVerified) {
    return res.status(403).json({ error: 'Please verify your email address to access the application.' });
  }

  req.user = decoded;
  next();
}
