import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { mfaTotpVerifySchema, mfaRecoveryVerifySchema } from '$lib/schemas/auth';
import { verifyMfaTotp, verifyMfaRecovery } from '$lib/api/auth';
import {
	setCookies,
	clearMfaPartialToken,
	MFA_PARTIAL_TOKEN_COOKIE,
	SYSTEM_TENANT_ID
} from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ cookies }) => {
	const partialToken = cookies.get(MFA_PARTIAL_TOKEN_COOKIE) ?? '';

	if (!partialToken) {
		redirect(302, '/login');
	}

	const totpForm = await superValidate(zod(mfaTotpVerifySchema));
	totpForm.data.partial_token = '';

	const recoveryForm = await superValidate(zod(mfaRecoveryVerifySchema));
	recoveryForm.data.partial_token = '';

	return { totpForm, recoveryForm };
};

export const actions: Actions = {
	totp: async ({ request, cookies, fetch }) => {
		const form = await superValidate(request, zod(mfaTotpVerifySchema));
		const partialToken = cookies.get(MFA_PARTIAL_TOKEN_COOKIE) ?? form.data.partial_token;

		if (!form.valid) {
			return fail(400, { totpForm: form });
		}
		if (!partialToken) {
			redirect(302, '/login');
		}

		try {
			const tenantId = cookies.get('tenant_id') || SYSTEM_TENANT_ID;
			const tokens = await verifyMfaTotp(partialToken, form.data.code, fetch, tenantId);
			setCookies(cookies, tokens);
			clearMfaPartialToken(cookies);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'Verification failed', { status: 500 });
		}

		redirect(302, '/dashboard');
	},

	recovery: async ({ request, cookies, fetch }) => {
		const form = await superValidate(request, zod(mfaRecoveryVerifySchema));
		const partialToken = cookies.get(MFA_PARTIAL_TOKEN_COOKIE) ?? form.data.partial_token;

		if (!form.valid) {
			return fail(400, { recoveryForm: form });
		}
		if (!partialToken) {
			redirect(302, '/login');
		}

		try {
			const tenantId = cookies.get('tenant_id') || SYSTEM_TENANT_ID;
			const tokens = await verifyMfaRecovery(partialToken, form.data.code, fetch, tenantId);
			setCookies(cookies, tokens);
			clearMfaPartialToken(cookies);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'Verification failed', { status: 500 });
		}

		redirect(302, '/dashboard');
	}
};
