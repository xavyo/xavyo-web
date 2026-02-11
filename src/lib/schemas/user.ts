import { z } from 'zod/v3';

export const createUserSchema = z.object({
	email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
	roles: z.array(z.string()).min(1, 'At least one role must be selected'),
	username: z.string().max(100, 'Username must be 100 characters or less').optional()
});

export const updateUserSchema = z.object({
	email: z.string().email('Please enter a valid email address').optional(),
	roles: z.array(z.string()).min(1, 'At least one role must be selected').optional(),
	username: z.string().max(100, 'Username must be 100 characters or less').optional()
});

export type CreateUserSchema = typeof createUserSchema;
export type UpdateUserSchema = typeof updateUserSchema;
