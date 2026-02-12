import { z } from 'zod/v3';

export const createScimTokenSchema = z.object({
	name: z.string().min(1, 'Token name is required').max(255, 'Name must be at most 255 characters')
});

export const mappingRequestSchema = z.object({
	scim_path: z.string().min(1),
	xavyo_field: z.string().min(1),
	transform: z.enum(['lowercase', 'uppercase', 'trim']).nullable(),
	required: z.boolean()
});
