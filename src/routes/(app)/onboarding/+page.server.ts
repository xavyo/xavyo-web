import { dev } from '$app/environment';
import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { onboardingSchema } from '$lib/schemas/onboarding';
import { provisionTenant } from '$lib/api/tenants';
import { ApiError } from '$lib/api/client';
import { setCookies, SYSTEM_TENANT_ID } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.tenantId && locals.tenantId !== SYSTEM_TENANT_ID) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(onboardingSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, cookies, locals, fetch }) => {
		const form = await superValidate(request, zod(onboardingSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const result = await provisionTenant(
				form.data.organizationName,
				locals.accessToken ?? '',
				fetch
			);

			const secure = !dev;

			// Set the tenant_id cookie for the new tenant
			cookies.set('tenant_id', result.tenant.id, {
				httpOnly: true,
				secure,
				sameSite: 'lax',
				path: '/',
				maxAge: 60 * 60 * 24 * 30 // 30 days
			});

			// If the provision response includes tokens, use them directly
			if (result.tokens) {
				setCookies(cookies, result.tokens);
			} else {
				// Backend doesn't return tokens — clear old system tenant token
				// The user will need to log in to the new tenant
				cookies.delete('access_token', { path: '/' });
				cookies.delete('refresh_token', { path: '/' });
			}
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/dashboard');
	}
};
