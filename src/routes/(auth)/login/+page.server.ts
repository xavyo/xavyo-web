import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { loginSchema } from '$lib/schemas/auth';
import { login, getAvailableMethods } from '$lib/api/auth';
import { setCookies, SYSTEM_TENANT_ID } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, url, cookies }) => {
	// Allow clearing a stale tenant cookie from the login page
	// (e.g., when the tenant was deleted and login keeps failing)
	if (url.searchParams.get('reset_tenant') === 'true') {
		cookies.delete('tenant_id', { path: '/' });
		redirect(302, '/login');
	}

	if (locals.user) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(loginSchema));

	let availableMethods = { magic_link: false, email_otp: false };
	try {
		availableMethods = await getAvailableMethods(undefined, fetch);
	} catch {
		// passwordless not available
	}

	return { form, redirectTo: url.searchParams.get('redirectTo') ?? '', availableMethods };
};

export const actions: Actions = {
	default: async ({ request, cookies, fetch, url }) => {
		const form = await superValidate(request, zod(loginSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const tenantId = cookies.get('tenant_id') || SYSTEM_TENANT_ID;

		try {
			const result = await login(
				{
					email: form.data.email,
					password: form.data.password
				},
				tenantId,
				fetch
			);

			// Check if MFA is required (partial_token in response)
			const asRecord = result as unknown as Record<string, unknown>;
			if (asRecord.mfa_required && asRecord.partial_token) {
				redirect(302, `/mfa?partial_token=${encodeURIComponent(String(asRecord.partial_token))}`);
			}

			setCookies(cookies, result);
		} catch (e) {
			if (e instanceof ApiError) {
				// Email not verified — redirect to check-email page
				if (e.errorType.endsWith('email-not-verified')) {
					redirect(302, `/check-email?email=${encodeURIComponent(form.data.email)}`);
				}
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		const redirectTo = url.searchParams.get('redirectTo');
		if (redirectTo) {
			try {
				const target = new URL(redirectTo, url.origin);
				if (target.origin === url.origin && target.pathname.startsWith('/')) {
					redirect(302, target.pathname + target.search + target.hash);
				}
			} catch {
				// invalid URL — ignore
			}
		}
		redirect(302, '/dashboard');
	}
};
