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

			// Save new JWT tokens scoped to the provisioned tenant (super_admin role)
			setCookies(cookies, result.tokens);

			const secure = !dev;
			cookies.set('tenant_id', result.tenant.id, {
				httpOnly: true,
				secure,
				sameSite: 'lax',
				path: '/',
				maxAge: 60 * 60 * 24 * 30 // 30 days
			});

			return { form, result };
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}
	}
};
