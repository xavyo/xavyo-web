import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createAccessRequestSchema } from '$lib/schemas/governance';
import { createAccessRequest } from '$lib/api/access-requests';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(createAccessRequestSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createAccessRequestSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await createAccessRequest(
				{
					entitlement_id: form.data.entitlement_id,
					justification: form.data.justification,
					requested_expires_at: form.data.requested_expires_at || undefined
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

		redirect(302, '/my-requests');
	}
};
