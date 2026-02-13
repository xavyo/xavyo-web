import { z } from 'zod/v3';

export const extendPersonaSchema = z.object({
	new_valid_until: z.string().min(1, 'Expiration date is required'),
	reason: z.string().optional().default('')
});

export type ExtendPersonaFormData = z.infer<typeof extendPersonaSchema>;
