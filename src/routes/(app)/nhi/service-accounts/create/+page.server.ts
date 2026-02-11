import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createServiceAccountSchema } from '$lib/schemas/nhi';
import { createServiceAccount } from '$lib/api/nhi';
import { ApiError } from '$lib/api/client';
import type { CreateServiceAccountRequest } from '$lib/api/types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(createServiceAccountSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createServiceAccountSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const body: CreateServiceAccountRequest = {
			name: form.data.name,
			purpose: form.data.purpose,
			description: form.data.description || undefined,
			environment: form.data.environment || undefined
		};

		try {
			await createServiceAccount(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/nhi');
	}
};
