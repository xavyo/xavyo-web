import { z } from 'zod/v3';

export const createInvitationSchema = z.object({
	email: z.string().min(1, 'Email is required').email('Invalid email format'),
	role: z.enum(['member', 'admin']).default('member')
});

export type CreateInvitationFormData = z.infer<typeof createInvitationSchema>;
