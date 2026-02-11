import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createUserSchema } from '$lib/schemas/user';
import { createUser } from '$lib/api/users';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(createUserSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createUserSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await createUser(
				{
					email: form.data.email,
					password: form.data.password,
					roles: form.data.roles,
					username: form.data.username || undefined
				},
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/users');
	}
};
