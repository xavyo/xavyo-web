import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { emailOtpRequestSchema, emailOtpVerifySchema } from '$lib/schemas/auth';
import { requestEmailOtp, verifyEmailOtp } from '$lib/api/auth';
import { setCookies, decodeAccessToken } from '$lib/server/auth';
import { dev } from '$app/environment';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async () => {
	const requestForm = await superValidate(zod(emailOtpRequestSchema), { id: 'request' });
	const verifyForm = await superValidate(zod(emailOtpVerifySchema), { id: 'verify' });
	return { requestForm, verifyForm };
};

export const actions: Actions = {
	request: async ({ request, cookies, fetch }) => {
		const requestForm = await superValidate(request, zod(emailOtpRequestSchema), { id: 'request' });

		if (!requestForm.valid) {
			return fail(400, { requestForm });
		}

		const tenantId = cookies.get('tenant_id');

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

	verify: async ({ request, cookies, fetch }) => {
		const verifyForm = await superValidate(request, zod(emailOtpVerifySchema), { id: 'verify' });

		if (!verifyForm.valid) {
			return fail(400, { verifyForm });
		}

		const tenantId = cookies.get('tenant_id');

		try {
			const result = await verifyEmailOtp(
				verifyForm.data.email,
				verifyForm.data.code,
				tenantId,
				fetch
			);

			if ('mfa_required' in result && (result as Record<string, unknown>).mfa_required) {
				const partial = result as unknown as { partial_token: string };
				redirect(302, `/mfa?partial_token=${encodeURIComponent(partial.partial_token)}`);
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
			if (e instanceof ApiError) {
				return message(verifyForm, e.message, { status: e.status as ErrorStatus });
			}
			return message(verifyForm, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/dashboard');
	}
};
