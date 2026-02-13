import { z } from 'zod/v3';

export const submitNhiRequestSchema = z.object({
	name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
	purpose: z.string().min(10, 'Purpose must be at least 10 characters'),
	requested_permissions: z.string().optional().default(''),
	requested_expiration: z.string().optional().default(''),
	rotation_interval_days: z.coerce.number().min(1).max(365).optional()
});

export type SubmitNhiRequestFormData = z.infer<typeof submitNhiRequestSchema>;

export const approveNhiRequestSchema = z.object({
	comments: z.string().optional().default('')
});

export type ApproveNhiRequestFormData = z.infer<typeof approveNhiRequestSchema>;

export const rejectNhiRequestSchema = z.object({
	reason: z.string().min(5, 'Reason must be at least 5 characters')
});

export type RejectNhiRequestFormData = z.infer<typeof rejectNhiRequestSchema>;

export const NHI_REQUEST_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'] as const;
