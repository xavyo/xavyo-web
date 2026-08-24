import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getBranding, updateBranding } from '$lib/api/branding';
import type { BrandingConfig } from '$lib/api/types';

const BRANDING_STRING_FIELDS = [
	'logo_url',
	'logo_dark_url',
	'favicon_url',
	'email_logo_url',
	'primary_color',
	'secondary_color',
	'accent_color',
	'background_color',
	'text_color',
	'font_family',
	'custom_css',
	'login_page_title',
	'login_page_subtitle',
	'login_page_background_url',
	'footer_text',
	'privacy_policy_url',
	'terms_of_service_url',
	'support_url',
	'consent_page_title',
	'consent_page_subtitle',
	'consent_approval_button_text',
	'consent_denial_button_text'
] as const;

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getBranding(locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const PUT: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	let parsed: unknown;
	try {
		parsed = await request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		error(400, 'Invalid JSON body');
	}
	const body = parsed as Record<string, unknown>;
	const data: Partial<BrandingConfig> = {};
	for (const key of BRANDING_STRING_FIELDS) {
		if (body[key] !== undefined) {
			if (body[key] !== null && typeof body[key] !== 'string') {
				error(400, `${key} must be a string or null`);
			}
			data[key] = body[key] as string | null;
		}
	}
	const result = await updateBranding(data, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
