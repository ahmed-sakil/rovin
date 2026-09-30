import { z } from 'zod';
import { Gender } from '@prisma/client';

// Bangladesh 11-digit mobile regex: 013, 014, 015, 016, 017, 018, 019
export const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;

export const RegisterOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(BD_PHONE_REGEX, 'Enter a valid 11-digit BD mobile number (e.g. 017XXXXXXXX)'),
});

export const VerifyAndRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(BD_PHONE_REGEX, 'Enter a valid 11-digit BD mobile number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  otp: z.string().length(6, 'Verification code must be exactly 6 digits'),
  gender: z.nativeEnum(Gender).default(Gender.MALE),
  dateOfBirth: z.string().optional(),
});

export const LoginSchema = z.object({
  identifier: z.string().min(3, 'Provide your email or BD phone number'),
  password: z.string().min(1, 'Password is required'),
});

export const ForgotPasswordOtpSchema = z.object({
  identifier: z.string().min(3, 'Provide registered email or phone'),
});

export const ResetPasswordSchema = z.object({
  identifier: z.string().min(3, 'Provide registered email or phone'),
  otp: z.string().length(6, 'Verification code must be exactly 6 digits'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});
