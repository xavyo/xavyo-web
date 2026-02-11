import { dev } from '$app/environment';
import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { signupSchema } from '$lib/schemas/auth';
import { signup } from '$lib/api/auth';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(signupSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, cookies, fetch }) => {
		const form = await superValidate(request, zod(signupSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const result = await signup(
				{
					email: form.data.email,
					password: form.data.password,
					display_name: form.data.displayName
				},
				fetch
			);

			const secure = !dev;
			cookies.set('access_token', result.access_token, {
				httpOnly: true,
				secure,
				sameSite: 'lax',
				path: '/',
				maxAge: result.expires_in
			});
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/onboarding');
	}
};
