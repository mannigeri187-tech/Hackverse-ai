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

// 4. Rate Limiting Middleware Configurations
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory store (WARNING: For Vercel Serverless Production, a distributed store like @upstash/ratelimit is recommended)
const rateLimitStore = new Map<string, RateLimitRecord>();

// Environment configurations
const AUTH_RATE_LIMIT = parseInt(process.env.AUTH_RATE_LIMIT || '5', 10);
const AUTH_RATE_WINDOW = parseInt(process.env.AUTH_RATE_WINDOW || '900', 10) * 1000; // 15 mins default

const PUBLIC_RATE_LIMIT = parseInt(process.env.PUBLIC_RATE_LIMIT || '60', 10);
const PUBLIC_RATE_WINDOW = parseInt(process.env.PUBLIC_RATE_WINDOW || '60', 10) * 1000; // 1 min

const AUTH_API_RATE_LIMIT = parseInt(process.env.AUTHENTICATED_RATE_LIMIT || '120', 10);
const AUTH_API_RATE_WINDOW = parseInt(process.env.AUTHENTICATED_RATE_WINDOW || '60', 10) * 1000;

const AI_RATE_LIMIT = parseInt(process.env.AI_RATE_LIMIT || '10', 10);
const AI_RATE_WINDOW = parseInt(process.env.AI_RATE_WINDOW || '3600', 10) * 1000; // 1 hour

/**
 * Core rate limiter engine
 */
function createRateLimiter(
  type: 'auth' | 'public' | 'authenticated' | 'ai',
  maxAttempts: number,
  windowMs: number,
  useProgressiveBackoff = false
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Determine identity keys
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    
    // For auth routes, we want to limit by IP AND Email (if provided)
    let identifier = ip;
    if (type === 'auth' && req.body && req.body.email) {
      identifier = `${ip}:${req.body.email.toLowerCase()}`;
    } else if ((type === 'authenticated' || type === 'ai') && (req as any).user?.userId) {
      identifier = (req as any).user.userId;
    }
    
    const key = `ratelimit:${type}:${identifier}`;
    const now = Date.now();
    const record = rateLimitStore.get(key);

    // Clean up expired records occasionally to prevent memory leaks
    if (Math.random() < 0.01) {
      for (const [k, v] of rateLimitStore.entries()) {
        if (now > v.resetTime) rateLimitStore.delete(k);
      }
    }

    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    // Check if limit exceeded
    if (record.count >= maxAttempts) {
      let delayMs = 0;
      let remainingSeconds = Math.ceil((record.resetTime - now) / 1000);

      if (useProgressiveBackoff) {
        // Exponential backoff for auth routes
        const violations = record.count - maxAttempts + 1;
        delayMs = Math.min(1000 * Math.pow(2, violations), 60000); // Max 60s artificial delay
        
        // Wait asynchronously before rejecting
        setTimeout(() => {
          res.setHeader('Retry-After', remainingSeconds.toString());
          res.status(429).json({
            error: 'Too many requests. Please try again later.'
          });
        }, delayMs);
        
        record.count += 1;
        rateLimitStore.set(key, record);
        return; // Response sent in timeout
      }

      // Standard immediate rejection
      res.setHeader('Retry-After', remainingSeconds.toString());
      return res.status(429).json({
        error: 'Too many requests. Please try again later.'
      });
    }

    record.count += 1;
    rateLimitStore.set(key, record);
    next();
  };
}

export const authRateLimiter = createRateLimiter('auth', AUTH_RATE_LIMIT, AUTH_RATE_WINDOW, true);
export const publicRateLimiter = createRateLimiter('public', PUBLIC_RATE_LIMIT, PUBLIC_RATE_WINDOW, false);
export const apiRateLimiter = createRateLimiter('authenticated', AUTH_API_RATE_LIMIT, AUTH_API_RATE_WINDOW, false);
export const aiRateLimiter = createRateLimiter('ai', AI_RATE_LIMIT, AI_RATE_WINDOW, false);


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
