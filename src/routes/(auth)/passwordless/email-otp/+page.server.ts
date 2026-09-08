import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { emailOtpRequestSchema, emailOtpVerifySchema } from '$lib/schemas/auth';
import { requestEmailOtp, verifyEmailOtp } from '$lib/api/auth';
import {
	setCookies,
	decodeAccessToken,
	setMfaPartialToken,
	requestTenantId,
	stampTenantCookieFromQuery
} from '$lib/server/auth';
import { dev } from '$app/environment';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ cookies, url }) => {
	// Persist ?tenant= so both the request and verify actions keep tenant scope.
	stampTenantCookieFromQuery(cookies, url);
	const requestForm = await superValidate(zod(emailOtpRequestSchema), { id: 'request' });
	const verifyForm = await superValidate(zod(emailOtpVerifySchema), { id: 'verify' });
	return { requestForm, verifyForm };
};

export const actions: Actions = {
	request: async ({ request, cookies, fetch, url }) => {
		const requestForm = await superValidate(request, zod(emailOtpRequestSchema), { id: 'request' });

		if (!requestForm.valid) {
			return fail(400, { requestForm });
		}

		const tenantId = requestTenantId(url, cookies);

		try {
			await requestEmailOtp(requestForm.data.email, tenantId, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(requestForm, e.message, { status: e.status as ErrorStatus });
			}
			return message(requestForm, 'An unexpected error occurred', { status: 500 });
		}

		return { requestForm, codeSent: true, email: requestForm.data.email };
	},

	verify: async ({ request, cookies, fetch, url }) => {
		const verifyForm = await superValidate(request, zod(emailOtpVerifySchema), { id: 'verify' });

		if (!verifyForm.valid) {
			// Stay on the code-entry step so the user can correct the code instead of
			// being bounced back to the email-request form (which forces a re-send and
			// trips rate limiting).
			return fail(400, { verifyForm, codeSent: true, email: verifyForm.data.email });
		}

		const tenantId = requestTenantId(url, cookies);

		try {
			const result = await verifyEmailOtp(
				verifyForm.data.email,
				verifyForm.data.code,
				tenantId,
				fetch
			);

			if ('mfa_required' in result && (result as Record<string, unknown>).mfa_required) {
				const partial = result as unknown as { partial_token: string };
				setMfaPartialToken(cookies, partial.partial_token);
				redirect(302, '/mfa');
			}

			setCookies(cookies, result);

			const claims = decodeAccessToken(result.access_token);
			if (claims?.tid) {
				cookies.set('tenant_id', claims.tid, {
					httpOnly: true,
					secure: !dev,
					sameSite: 'lax',
					path: '/',
					maxAge: 60 * 60 * 24 * 30
				});
			}
		} catch (e) {
			// Keep the user on the code-entry step (with the error) rather than
			// resetting to the email-request form on a wrong/expired code.
			const status = e instanceof ApiError ? e.status : 500;
			const errorMessage = e instanceof ApiError ? e.message : 'An unexpected error occurred';
			return fail(status, {
				verifyForm,
				codeSent: true,
				email: verifyForm.data.email,
				error: errorMessage
			});
		}

		redirect(302, '/dashboard');
	}
};
