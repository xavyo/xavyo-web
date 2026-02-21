import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { mfaTotpVerifySchema, mfaRecoveryVerifySchema } from '$lib/schemas/auth';
import { verifyMfaTotp, verifyMfaRecovery } from '$lib/api/auth';
import { setCookies } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ url }) => {
	const partialToken = url.searchParams.get('partial_token') ?? '';

	if (!partialToken) {
		redirect(302, '/login');
	}

	const totpForm = await superValidate(zod(mfaTotpVerifySchema));
	totpForm.data.partial_token = partialToken;

	const recoveryForm = await superValidate(zod(mfaRecoveryVerifySchema));
	recoveryForm.data.partial_token = partialToken;

	return { totpForm, recoveryForm, partialToken };
};

export const actions: Actions = {
	totp: async ({ request, cookies, fetch }) => {
		const form = await superValidate(request, zod(mfaTotpVerifySchema));

		if (!form.valid) {
			return fail(400, { totpForm: form });
		}

		try {
			const tokens = await verifyMfaTotp(form.data.partial_token, form.data.code, fetch);
			setCookies(cookies, tokens);
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

		if (!form.valid) {
			return fail(400, { recoveryForm: form });
		}

		try {
			const tokens = await verifyMfaRecovery(form.data.partial_token, form.data.code, fetch);
			setCookies(cookies, tokens);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'Verification failed', { status: 500 });
		}

		redirect(302, '/dashboard');
	}
};
