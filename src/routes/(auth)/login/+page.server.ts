import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { loginSchema } from '$lib/schemas/auth';
import { login, getAvailableMethods } from '$lib/api/auth';
import {
	setCookies,
	setMfaPartialToken,
	SYSTEM_TENANT_ID,
	requestTenantId,
	stampTenantCookieFromQuery
} from '$lib/server/auth';
import { safeInternalPath } from '$lib/utils/redirect';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, url, cookies, fetch }) => {
	// Allow clearing a stale tenant cookie from the login page
	// (e.g., when the tenant was deleted and login keeps failing)
	if (url.searchParams.get('reset_tenant') === 'true') {
		cookies.delete('tenant_id', { path: '/' });
		redirect(302, '/login');
	}

	if (locals.user) {
		// Respect redirectTo even when already logged in — this handles the case
		// where superForm's enhance re-runs the load function after login succeeds
		// (via invalidateAll) before the form action's redirect is processed.
		const safe = safeInternalPath(url.searchParams.get('redirectTo'), url.origin);
		if (safe) {
			redirect(302, safe);
		}
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(loginSchema));

	stampTenantCookieFromQuery(cookies, url);
	let availableMethods = { magic_link: false, email_otp: false };
	try {
		availableMethods = await getAvailableMethods(requestTenantId(url, cookies), fetch);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load available login methods');
	}

	return {
		form,
		redirectTo: safeInternalPath(url.searchParams.get('redirectTo'), url.origin) ?? '',
		availableMethods
	};
};

export const actions: Actions = {
	default: async ({ request, cookies, fetch, url }) => {
		const form = await superValidate(request, zod(loginSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const tenantId = requestTenantId(url, cookies) || SYSTEM_TENANT_ID;

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
				setMfaPartialToken(cookies, String(asRecord.partial_token));
				redirect(302, '/mfa');
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

		const safe = safeInternalPath(url.searchParams.get('redirectTo'), url.origin);
		if (safe) {
			redirect(302, safe);
		}
		redirect(302, '/dashboard');
	}
};
