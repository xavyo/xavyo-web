import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { resetPasswordSchema } from '$lib/schemas/auth';
import { resetPassword } from '$lib/api/auth';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token') ?? '';
	const form = await superValidate({ token, newPassword: '' }, zod(resetPasswordSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const form = await superValidate(request, zod(resetPasswordSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await resetPassword(form.data.token, form.data.newPassword, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		return message(form, 'Password has been reset successfully. You can now log in.');
	}
};
