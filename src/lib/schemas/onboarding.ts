import { z } from 'zod/v3';

export const onboardingSchema = z.object({
	organizationName: z
		.string()
		.min(1, 'Organization name is required')
		.max(100, 'Organization name must be 100 characters or less')
		.regex(
			/^[a-zA-Z0-9 \-_]+$/,
			'Only letters, numbers, spaces, hyphens, and underscores are allowed'
		)
});

export type OnboardingSchema = typeof onboardingSchema;
