import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signJwtToken } from '../utils/jwt.js';
import { getRandomDefaultAvatar } from '../utils/avatars.js';
import { getOtpProvider } from '../services/otp/index.js';
import { logUserActivity } from '../middlewares/activityLogger.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import {
  RegisterOtpSchema,
  VerifyAndRegisterSchema,
  LoginSchema,
  ForgotPasswordOtpSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
} from '../utils/validators.js';

// Helper: Generate secure 6-digit random code
function generate6DigitOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 1. Request 6-Digit OTP for Account Registration
 */
export async function sendRegisterOtp(req: Request, res: Response): Promise<void> {
  try {
    const parsed = RegisterOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { email, phone } = parsed.data;

    // Check if user with this email or phone already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: existing.email === email
          ? 'An account with this email address already exists.'
          : 'An account with this mobile number already exists.',
      });
      return;
    }

    // Cooldown check: max 1 OTP request per 60 seconds for same email/phone
    const recentOtp = await prisma.otpVerification.findFirst({
      where: {
        identifier: email,
        purpose: 'REGISTER',
        createdAt: { gte: new Date(Date.now() - 60 * 1000) },
      },
    });

    if (recentOtp) {
      res.status(429).json({
        success: false,
        message: 'Security cooldown: Please wait 60 seconds before requesting another code.',
      });
      return;
    }

    const rawCode = generate6DigitOtp();
    const codeHash = await hashPassword(rawCode);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store in DB
    await prisma.otpVerification.create({
      data: {
        identifier: email,
        codeHash,
        purpose: 'REGISTER',
        expiresAt,
      },
    });

    // Dispatch OTP via configured provider (Console / Free Email / Pluggable SMS)
    const provider = getOtpProvider();
    await provider.sendOtp({
      recipient: email,
      code: rawCode,
      purpose: 'REGISTER',
    });

    res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${email}.`,
      expiresInSeconds: 300,
    });
  } catch (error: any) {
    console.error('[sendRegisterOtp Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to process verification code.' });
  }
}

/**
 * 2. Verify 6-Digit OTP and Complete Registration
 */
export async function verifyAndRegister(req: Request, res: Response): Promise<void> {
  try {
    const parsed = VerifyAndRegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { name, email, phone, password, otp, gender, dateOfBirth } = parsed.data;

    // Verify OTP
    const validOtpRecord = await prisma.otpVerification.findFirst({
      where: {
        identifier: email,
        purpose: 'REGISTER',
        isUsed: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!validOtpRecord) {
      res.status(400).json({
        success: false,
        message: 'Verification code expired or not found. Please request a new code.',
      });
      return;
    }

    const isMatch = await comparePassword(otp, validOtpRecord.codeHash);
    if (!isMatch) {
      // Increment attempt count
      await prisma.otpVerification.update({
        where: { id: validOtpRecord.id },
        data: { attempts: { increment: 1 } },
      });

      res.status(400).json({ success: false, message: 'Invalid 6-digit verification code.' });
      return;
    }

    // Mark OTP as used
    await prisma.otpVerification.update({
      where: { id: validOtpRecord.id },
      data: { isUsed: true },
    });

    // Assign 1 of 6 tactical default avatars according to gender
    const defaultAvatarUrl = getRandomDefaultAvatar(gender);
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        profileImageUrl: defaultAvatarUrl,
        isEmailVerified: true,
        isPhoneVerified: false,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        dateOfBirth: true,
        profileImageUrl: true,
        role: true,
        createdAt: true,
      },
    });

    // Log Activity
    await logUserActivity(newUser.id, 'REGISTER', req, { email, phone, gender });

    // Generate JWT Token
    const token = signJwtToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    res.status(201).json({
      success: true,
      message: 'Account calibrated successfully. Welcome to ROVIN.',
      token,
      user: newUser,
    });
  } catch (error: any) {
    console.error('[verifyAndRegister Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to complete registration.' });
  }
}

/**
 * 3. User Login
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { identifier, password } = parsed.data;

    // Search by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
      include: {
        addresses: true,
      },
    });

    if (!user) {
      await logUserActivity(null, 'FAILED_LOGIN', req, { identifier, reason: 'User not found' });
      res.status(401).json({ success: false, message: 'Invalid credentials provided.' });
      return;
    }

    // Verify Password
    const passwordValid = await comparePassword(password, user.passwordHash);
    if (!passwordValid) {
      await logUserActivity(user.id, 'FAILED_LOGIN', req, { identifier, reason: 'Bad password' });
      res.status(401).json({ success: false, message: 'Invalid credentials provided.' });
      return;
    }

    // Check Ban Status
    if (user.isBanned) {
      const isPermanent = !user.banExpiresAt;
      const isStillBanned = isPermanent || new Date(user.banExpiresAt!) > new Date();

      if (isStillBanned) {
        await logUserActivity(user.id, 'BANNED_LOGIN_ATTEMPT', req, { banReason: user.banReason });
        res.status(403).json({
          success: false,
          isBanned: true,
          message: `Account is suspended. Reason: ${user.banReason || 'Administrative suspension'}.`,
        });
        return;
      }
    }

    // Log Successful Login
    await logUserActivity(user.id, 'LOGIN', req, { identifier });

    // Generate JWT
    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
        addresses: user.addresses,
      },
    });
  } catch (error: any) {
    console.error('[login Error]:', error);
    res.status(500).json({ success: false, message: 'Authentication failure.' });
  }
}

/**
 * 4. Send Forgot Password 6-Digit OTP
 */
export async function sendForgotPasswordOtp(req: Request, res: Response): Promise<void> {
  try {
    const parsed = ForgotPasswordOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { identifier } = parsed.data;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });

    if (!user) {
      // Return 200 with vague message to prevent email enumeration
      res.status(200).json({
        success: true,
        message: 'If an account exists with this credential, a verification code was sent.',
      });
      return;
    }

    // Cooldown check (60 seconds)
    const recentOtp = await prisma.otpVerification.findFirst({
      where: {
        identifier: user.email,
        purpose: 'FORGOT_PASSWORD',
        createdAt: { gte: new Date(Date.now() - 60 * 1000) },
      },
    });

    if (recentOtp) {
      res.status(429).json({
        success: false,
        message: 'Security cooldown: Please wait 60 seconds before requesting another code.',
      });
      return;
    }

    const rawCode = generate6DigitOtp();
    const codeHash = await hashPassword(rawCode);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otpVerification.create({
      data: {
        userId: user.id,
        identifier: user.email,
        codeHash,
        purpose: 'FORGOT_PASSWORD',
        expiresAt,
      },
    });

    const provider = getOtpProvider();
    await provider.sendOtp({
      recipient: user.email,
      code: rawCode,
      purpose: 'FORGOT_PASSWORD',
      userName: user.name,
    });

    res.status(200).json({
      success: true,
      message: `A password reset code has been sent to ${user.email}.`,
      expiresInSeconds: 300,
    });
  } catch (error: any) {
    console.error('[sendForgotPasswordOtp Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to dispatch reset code.' });
  }
}

/**
 * 5. Verify OTP and Reset Password
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const parsed = ResetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { identifier, otp, newPassword } = parsed.data;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });

    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid password reset request.' });
      return;
    }

    const validOtp = await prisma.otpVerification.findFirst({
      where: {
        identifier: user.email,
        purpose: 'FORGOT_PASSWORD',
        isUsed: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!validOtp) {
      res.status(400).json({ success: false, message: 'Verification code has expired or is invalid.' });
      return;
    }

    const match = await comparePassword(otp, validOtp.codeHash);
    if (!match) {
      await prisma.otpVerification.update({
        where: { id: validOtp.id },
        data: { attempts: { increment: 1 } },
      });
      res.status(400).json({ success: false, message: 'Invalid verification code.' });
      return;
    }

    // Mark used
    await prisma.otpVerification.update({
      where: { id: validOtp.id },
      data: { isUsed: true },
    });

    const newPasswordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    await logUserActivity(user.id, 'PASSWORD_RESET', req);

    res.status(200).json({
      success: true,
      message: 'Password recalibrated successfully. You may now log in.',
    });
  } catch (error: any) {
    console.error('[resetPassword Error]:', error);
    res.status(500).json({ success: false, message: 'Password reset failed.' });
  }
}

/**
 * 6. Authenticated User: Get Profile (/api/auth/me)
 */
export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        dateOfBirth: true,
        profileImageUrl: true,
        role: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        addresses: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User profile not found.' });
      return;
    }

    res.status(200).json({ success: true, user });
  } catch (error: any) {
    console.error('[getMe Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
}

/**
 * 7. Authenticated User: Change Password (with 15-min cooldown)
 */
export async function changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const parsed = ChangePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { currentPassword, newPassword } = parsed.data;

    // Security Cooldown: Check if user changed password in the last 15 minutes
    const recentPasswordChange = await prisma.userActivityLog.findFirst({
      where: {
        userId: req.user.id,
        action: 'PASSWORD_CHANGE',
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      },
    });

    if (recentPasswordChange) {
      res.status(429).json({
        success: false,
        message: 'Security policy: You can only change your password once every 15 minutes.',
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const isCurrentValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      res.status(400).json({ success: false, message: 'Current password does not match records.' });
      return;
    }

    const newPasswordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    await logUserActivity(user.id, 'PASSWORD_CHANGE', req);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error: any) {
    console.error('[changePassword Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
}
