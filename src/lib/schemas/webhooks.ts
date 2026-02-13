import { z } from 'zod/v3';

export const createWebhookSubscriptionSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	description: z.string().max(1000).optional().default(''),
	url: z.string().url('Must be a valid URL'),
	secret: z.string().max(255).optional().default(''),
	event_types: z.string().min(1, 'Select at least one event type') // comma-separated for form
});

export const updateWebhookSubscriptionSchema = z.object({
	name: z.string().min(1).max(255).optional(),
	description: z.string().max(1000).optional(),
	url: z.string().url('Must be a valid URL').optional(),
	secret: z.string().max(255).optional(),
	event_types: z.string().optional() // comma-separated for form
});
