/**
 * Zod validators for website auth.
 */

import { z } from 'zod';

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Enter a valid email')
  .transform((value) => value.trim().toLowerCase());

const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(16, 'Password must be at most 16 characters');

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(55, 'Name must be at most 55 characters'),
    email: emailSchema,
    password: passwordSchema,
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: z.string().length(4, 'OTP must be 4 digits').regex(/^\d{4}$/, 'OTP must be 4 digits'),
});

export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    otp: z.string().length(4, 'OTP must be 4 digits').regex(/^\d{4}$/, 'OTP must be 4 digits'),
    password: passwordSchema,
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
