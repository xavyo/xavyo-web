import { z } from 'zod/v3';

export const createInvitationSchema = z.object({
	email: z.string().min(1, 'Email is required').email('Invalid email format')
});

export type CreateInvitationFormData = z.infer<typeof createInvitationSchema>;
