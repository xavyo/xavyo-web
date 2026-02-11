import { z } from 'zod/v3';

export const updateProfileSchema = z.object({
	display_name: z
		.string()
		.min(1, 'Display name is required')
		.max(100, 'Display name must be 100 characters or less'),
	first_name: z.string().max(100, 'First name must be 100 characters or less').optional().default(''),
	last_name: z.string().max(100, 'Last name must be 100 characters or less').optional().default(''),
	avatar_url: z
		.string()
		.url('Please enter a valid URL')
		.max(2048, 'Avatar URL must be 2048 characters or less')
		.or(z.literal(''))
		.optional()
		.default('')
});

export const passwordChangeSchema = z
	.object({
		current_password: z.string().min(1, 'Current password is required'),
		new_password: z
			.string()
			.min(8, 'New password must be at least 8 characters')
			.max(128, 'New password must be 128 characters or less'),
		confirm_password: z.string().min(1, 'Please confirm your new password'),
		revoke_other_sessions: z.boolean().default(true)
	})
	.refine((data) => data.new_password === data.confirm_password, {
		message: 'Passwords do not match',
		path: ['confirm_password']
	});

export const totpVerifySchema = z.object({
	code: z
		.string()
		.length(6, 'Code must be exactly 6 digits')
		.regex(/^\d{6}$/, 'Code must contain only digits')
});

export const totpDisableSchema = z.object({
	password: z.string().min(1, 'Password is required'),
	code: z
		.string()
		.length(6, 'Code must be exactly 6 digits')
		.regex(/^\d{6}$/, 'Code must contain only digits')
});

export const recoveryRegenerateSchema = z.object({
	password: z.string().min(1, 'Password is required')
});

export const webauthnNameSchema = z.object({
	name: z.string().max(100, 'Name must be 100 characters or less').optional().default('')
});

export const emailChangeSchema = z.object({
	new_email: z
		.string()
		.min(1, 'Email is required')
		.email('Please enter a valid email address')
		.max(255, 'Email must be 255 characters or less'),
	current_password: z.string().min(1, 'Password is required')
});

export const emailVerifySchema = z.object({
	token: z.string().length(43, 'Verification token must be exactly 43 characters')
});

export const deviceRenameSchema = z.object({
	device_name: z
		.string()
		.min(1, 'Device name is required')
		.max(100, 'Device name must be 100 characters or less')
});

export const deviceTrustSchema = z.object({
	trust_duration_days: z
		.number()
		.int()
		.min(0, 'Duration must be 0-365 days')
		.max(365, 'Duration must be 0-365 days')
		.optional()
});

export type UpdateProfileSchema = typeof updateProfileSchema;
export type PasswordChangeSchema = typeof passwordChangeSchema;
export type TotpVerifySchema = typeof totpVerifySchema;
export type TotpDisableSchema = typeof totpDisableSchema;
export type RecoveryRegenerateSchema = typeof recoveryRegenerateSchema;
export type WebauthnNameSchema = typeof webauthnNameSchema;
export type EmailChangeSchema = typeof emailChangeSchema;
export type EmailVerifySchema = typeof emailVerifySchema;
export type DeviceRenameSchema = typeof deviceRenameSchema;
export type DeviceTrustSchema = typeof deviceTrustSchema;
