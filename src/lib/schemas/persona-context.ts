import { z } from 'zod/v3';

export const switchContextSchema = z.object({
	persona_id: z.string().uuid('Invalid persona ID'),
	reason: z.string().optional().default('')
});

export type SwitchContextFormData = z.infer<typeof switchContextSchema>;

export const switchBackSchema = z.object({
	reason: z.string().optional().default('')
});

export type SwitchBackFormData = z.infer<typeof switchBackSchema>;
