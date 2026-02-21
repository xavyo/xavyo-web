import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { magicLinkRequestSchema } from '$lib/schemas/auth';
import { requestMagicLink } from '$lib/api/auth';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(magicLinkRequestSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, cookies, fetch }) => {
		const form = await superValidate(request, zod(magicLinkRequestSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const tenantId = cookies.get('tenant_id');

		try {
			await requestMagicLink(form.data.email, tenantId, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/passwordless/magic-link/sent');
	}
};
