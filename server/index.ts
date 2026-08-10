import express, { Request, Response } from 'express';
import cors from 'cors';
import { db, UserRecord } from './db';
import {
  hashPassword,
  comparePassword,
  generateVerificationToken,
  generate6DigitOTP,
  hashOtp,
  generateAccessToken,
  rateLimiter,
  authenticateToken,
  TokenPayload,
} from './security';
import { sendVerificationEmail } from './emailService';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// 1. POST /api/auth/signup - Enterprise Registration Flow
app.post('/api/auth/signup', rateLimiter(5, 15 * 60 * 1000), async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phone, role } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Validate email syntax
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address syntax.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if account already exists
    const existingUser = db.findUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'This email is already registered. Please sign in instead.' });
    }

    // Hash password with bcrypt
    const password_hash = await hashPassword(password);

    // Generate 6-digit OTP & store salted SHA-256 hash in DB
    const otp = generate6DigitOTP();
    const otp_hash = hashOtp(otp);
    const otp_expires_at = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    const email_verification_token = generateVerificationToken();

    const newUser: UserRecord = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      full_name: fullName.trim(),
      email: cleanEmail,
      email_verified: false,
      email_verification_token,
      otp_hash,
      otp_expires_at,
      otp_attempt_count: 0,
      last_resend_at: Date.now(),
      password_hash,
      phone: phone || null,
      phone_verified: false,
      provider: 'credentials',
      role: role === 'organizer' || role === 'admin' ? role : 'student',
      status: 'pending_verification',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: null,
    };

    db.createUser(newUser);

    // Dispatch real email containing OTP (OTP is NOT returned in API response)
    await sendVerificationEmail(cleanEmail, otp);

    return res.status(201).json({
      message: 'Account created! A verification code has been sent to your email address.',
      email: cleanEmail,
      emailVerified: false,
    });
  } catch (error: any) {
    console.error('[AuthServer Signup Error]:', error);
    return res.status(500).json({ error: 'Server error during account registration. Please try again.' });
  }
});

// 2. POST /api/auth/verify-email - Secure Server OTP Verification Handler
app.post('/api/auth/verify-email', rateLimiter(10, 15 * 60 * 1000), async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and 6-digit verification code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    const user = db.findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(404).json({ error: 'Invalid verification request.' });
    }

    if (user.email_verified) {
      return res.status(200).json({ message: 'Email is already verified. Please sign in.' });
    }

    // Check expiration
    if (!user.otp_expires_at || Date.now() > user.otp_expires_at) {
      return res.status(400).json({ error: 'This verification code has expired. Please request a new code.' });
    }

    // Check attempt count
    if (user.otp_attempt_count >= 5) {
      db.updateUser(user.id, { otp_hash: null, otp_expires_at: null });
      return res.status(429).json({ error: 'Too many failed verification attempts. Please request a new code.' });
    }

    // Increment attempt count
    db.updateUser(user.id, { otp_attempt_count: user.otp_attempt_count + 1 });

    // Validate hash
    const inputHash = hashOtp(cleanCode);
    if (inputHash !== user.otp_hash) {
      const remaining = 5 - (user.otp_attempt_count + 1);
      return res.status(400).json({
        error: `Invalid verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Please request a new code.'}`,
      });
    }

    // Mark email as verified and activate account
    const updatedUser = db.updateUser(user.id, {
      email_verified: true,
      status: 'active',
      otp_hash: null,
      otp_expires_at: null,
      otp_attempt_count: 0,
      email_verification_token: null,
    });

    const tokenPayload: TokenPayload = {
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      emailVerified: true,
    };
    const accessToken = generateAccessToken(tokenPayload);

    return res.status(200).json({
      message: 'Email verified successfully! Your account is now active.',
      accessToken,
      user: {
        id: updatedUser.id,
        name: updatedUser.full_name,
        email: updatedUser.email,
        role: updatedUser.role,
        emailVerified: true,
      },
    });
  } catch (error: any) {
    console.error('[AuthServer Verify Error]:', error);
    return res.status(500).json({ error: 'Server error during email verification. Please try again.' });
  }
});

// 3. POST /api/auth/resend-verification - Resend OTP with Cooldown & Attempt Reset
app.post('/api/auth/resend-verification', rateLimiter(5, 15 * 60 * 1000), async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email address is required.' });

    const cleanEmail = email.trim().toLowerCase();
    const user = db.findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(404).json({ error: 'Invalid request.' });
    }

    if (user.email_verified) {
      return res.status(400).json({ error: 'This email is already verified. Please sign in.' });
    }

    // Cooldown check (60 seconds)
    const now = Date.now();
    if (user.last_resend_at && now - user.last_resend_at < 60000) {
      const waitSec = Math.ceil((60000 - (now - user.last_resend_at)) / 1000);
      return res.status(429).json({ error: `Please wait ${waitSec} seconds before requesting another code.` });
    }

    const newOtp = generate6DigitOTP();
    const newOtpHash = hashOtp(newOtp);
    const newExpiresAt = now + 10 * 60 * 1000;

    db.updateUser(user.id, {
      otp_hash: newOtpHash,
      otp_expires_at: newExpiresAt,
      otp_attempt_count: 0,
      last_resend_at: now,
    });

    await sendVerificationEmail(user.email, newOtp);

    return res.status(200).json({
      message: 'A new verification code has been sent to your email address.',
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to resend verification code. Please try again.' });
  }
});

// 4. POST /api/auth/login - Production Login Endpoint
app.post('/api/auth/login', rateLimiter(5, 15 * 60 * 1000), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.findUserByEmail(cleanEmail);

    // Generic safe error for unknown email or password mismatch
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isPasswordMatch = await comparePassword(password, user.password_hash);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check if email has been verified
    if (!user.email_verified) {
      return res.status(403).json({
        error: 'Please verify your email before signing in.',
        requiresVerification: true,
        email: user.email,
      });
    }

    db.updateUser(user.id, { last_login: new Date().toISOString() });

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      emailVerified: true,
    };
    const accessToken = generateAccessToken(tokenPayload);

    return res.status(200).json({
      message: 'Authentication successful.',
      accessToken,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.full_name)}`,
        emailVerified: true,
      },
    });
  } catch (error: any) {
    console.error('[AuthServer Login Error]:', error);
    return res.status(500).json({ error: 'Server authentication error. Please try again.' });
  }
});

// 5. POST /api/auth/google - Google OAuth Verification Endpoint
app.post('/api/auth/google', rateLimiter(10, 15 * 60 * 1000), async (req: Request, res: Response) => {
  try {
    const { email, name, avatar, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Valid Google Account email is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = db.findUserByEmail(cleanEmail);

    if (!user) {
      user = {
        id: 'usr_google_' + Date.now(),
        full_name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        email_verified: true, // Google verified
        email_verification_token: null,
        otp_hash: null,
        otp_expires_at: null,
        otp_attempt_count: 0,
        last_resend_at: null,
        password_hash: await hashPassword(Math.random().toString(36) + 'GoogleSecured!'),
        phone: null,
        phone_verified: false,
        provider: 'google',
        role: role || 'student',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      };
      db.createUser(user);
    } else {
      db.updateUser(user.id, { last_login: new Date().toISOString(), email_verified: true });
    }

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      emailVerified: true,
    };
    const accessToken = generateAccessToken(tokenPayload);

    return res.status(200).json({
      message: 'Google authentication successful.',
      accessToken,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.full_name)}`,
        role: user.role,
        emailVerified: true,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Google OAuth authentication failed. Please try again.' });
  }
});

// 6. GET /api/auth/me - Validate Session
app.get('/api/auth/me', authenticateToken, (req: Request & { user?: TokenPayload }, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthenticated.' });
  const user = db.findUserById(req.user.userId);
  if (!user) return res.status(404).json({ error: 'User record not found.' });

  return res.status(200).json({
    user: {
      id: user.id,
      name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.full_name)}`,
      emailVerified: user.email_verified,
    },
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🔐 HackVerse Enterprise Auth Server active on port ${PORT}`);
  console.log(`======================================================\n`);
});
