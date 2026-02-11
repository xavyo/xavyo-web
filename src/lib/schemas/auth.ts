import { z } from 'zod/v3';

export const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(1, 'Password is required')
});

export const signupSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.max(128, 'Password must not exceed 128 characters'),
	displayName: z.string().max(255, 'Display name must not exceed 255 characters').optional()
});

export const forgotPasswordSchema = z.object({
	email: z.string().email('Invalid email address')
});

export const resetPasswordSchema = z.object({
	token: z.string().length(43, 'Invalid reset token'),
	newPassword: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.max(128, 'Password must not exceed 128 characters')
});

export type LoginSchema = typeof loginSchema;
export type SignupSchema = typeof signupSchema;
export type ForgotPasswordSchema = typeof forgotPasswordSchema;
export type ResetPasswordSchema = typeof resetPasswordSchema;
