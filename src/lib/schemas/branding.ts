import { z } from 'zod/v3';

const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const urlOrEmpty = z.string().url().or(z.literal('')).optional().nullable();
const hexColorOrEmpty = z
	.string()
	.regex(hexColorRegex, 'Must be a valid hex color (e.g., #FF0000)')
	.or(z.literal(''))
	.optional()
	.nullable();

export const updateBrandingSchema = z.object({
	logo_url: urlOrEmpty,
	logo_dark_url: urlOrEmpty,
	favicon_url: urlOrEmpty,
	email_logo_url: urlOrEmpty,
	primary_color: hexColorOrEmpty,
	secondary_color: hexColorOrEmpty,
	accent_color: hexColorOrEmpty,
	background_color: hexColorOrEmpty,
	text_color: hexColorOrEmpty,
	font_family: z.string().max(255).optional().nullable(),
	custom_css: z.string().max(10240).optional().nullable(),
	login_page_title: z.string().max(255).optional().nullable(),
	login_page_subtitle: z.string().max(500).optional().nullable(),
	login_page_background_url: urlOrEmpty,
	footer_text: z.string().max(500).optional().nullable(),
	privacy_policy_url: urlOrEmpty,
	terms_of_service_url: urlOrEmpty,
	support_url: urlOrEmpty,
	consent_page_title: z.string().max(255).optional().nullable(),
	consent_page_subtitle: z.string().max(500).optional().nullable(),
	consent_approval_button_text: z.string().max(100).optional().nullable(),
	consent_denial_button_text: z.string().max(100).optional().nullable()
});

export type UpdateBrandingSchema = typeof updateBrandingSchema;
export type UpdateBrandingInput = z.infer<typeof updateBrandingSchema>;
