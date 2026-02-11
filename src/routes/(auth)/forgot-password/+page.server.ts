import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { forgotPasswordSchema } from '$lib/schemas/auth';
import { forgotPassword } from '$lib/api/auth';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(forgotPasswordSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const form = await superValidate(request, zod(forgotPasswordSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await forgotPassword(form.data.email, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		return message(form, 'If an account exists with that email, a reset link has been sent.');
	}
};
