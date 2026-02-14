import type { PageServerLoad, Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import type { ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { updateBrandingSchema } from '$lib/schemas/branding';
import { getBranding, updateBranding } from '$lib/api/branding';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	let branding = null;
	try {
		branding = await getBranding(locals.accessToken!, locals.tenantId!, fetch);
	} catch {
		// Branding may not be configured yet; fall back to empty form
	}

	const form = await superValidate(
		{
			logo_url: branding?.logo_url ?? '',
			logo_dark_url: branding?.logo_dark_url ?? '',
			favicon_url: branding?.favicon_url ?? '',
			email_logo_url: branding?.email_logo_url ?? '',
			primary_color: branding?.primary_color ?? '',
			secondary_color: branding?.secondary_color ?? '',
			accent_color: branding?.accent_color ?? '',
			background_color: branding?.background_color ?? '',
			text_color: branding?.text_color ?? '',
			font_family: branding?.font_family ?? '',
			custom_css: branding?.custom_css ?? '',
			login_page_title: branding?.login_page_title ?? '',
			login_page_subtitle: branding?.login_page_subtitle ?? '',
			login_page_background_url: branding?.login_page_background_url ?? '',
			footer_text: branding?.footer_text ?? '',
			privacy_policy_url: branding?.privacy_policy_url ?? '',
			terms_of_service_url: branding?.terms_of_service_url ?? '',
			support_url: branding?.support_url ?? '',
			consent_page_title: branding?.consent_page_title ?? '',
			consent_page_subtitle: branding?.consent_page_subtitle ?? '',
			consent_approval_button_text: branding?.consent_approval_button_text ?? '',
			consent_denial_button_text: branding?.consent_denial_button_text ?? ''
		},
		zod(updateBrandingSchema)
	);

	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(updateBrandingSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const body: Record<string, string | null> = {};
			for (const [key, value] of Object.entries(form.data)) {
				if (value !== undefined) {
					body[key] = value === '' ? null : (value as string);
				}
			}

			await updateBranding(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 as ErrorStatus });
		}

		return message(form, 'Branding updated successfully');
	}
};
