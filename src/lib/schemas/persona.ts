import { z } from 'zod/v3';

export const createArchetypeSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	description: z.string().max(1000).optional(),
	naming_pattern: z.string().min(1, 'Naming pattern is required').max(255),
	default_validity_days: z.coerce.number().int().min(1).max(3650).optional(),
	max_validity_days: z.coerce.number().int().min(1).max(3650).optional(),
	notification_before_expiry_days: z.coerce.number().int().min(1).optional()
});

export const updateArchetypeSchema = z.object({
	name: z.string().min(1).max(255).optional(),
	description: z.string().max(1000).optional(),
	naming_pattern: z.string().min(1).max(255).optional(),
	default_validity_days: z.coerce.number().int().min(1).max(3650).optional(),
	max_validity_days: z.coerce.number().int().min(1).max(3650).optional(),
	notification_before_expiry_days: z.coerce.number().int().min(1).optional()
});

export const createPersonaSchema = z.object({
	archetype_id: z.string().min(1, 'Archetype is required'),
	physical_user_id: z.string().min(1, 'Physical user is required'),
	valid_from: z.string().optional(),
	valid_until: z.string().optional()
});

export const updatePersonaSchema = z.object({
	display_name: z.string().min(1).optional(),
	valid_until: z.string().optional()
});

export const reasonSchema = z.object({
	reason: z.string().min(5, 'Reason must be at least 5 characters').max(1000)
});

export type CreateArchetypeSchema = typeof createArchetypeSchema;
export type UpdateArchetypeSchema = typeof updateArchetypeSchema;
export type CreatePersonaSchema = typeof createPersonaSchema;
export type UpdatePersonaSchema = typeof updatePersonaSchema;
export type ReasonSchema = typeof reasonSchema;
