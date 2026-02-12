import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { acceptInvitationSchema } from '$lib/schemas/imports';
import { validateInvitation, acceptInvitation } from '$lib/api/imports';
import { ApiError } from '$lib/api/client';
import type { InvitationValidationResponse } from '$lib/api/types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const form = await superValidate(zod(acceptInvitationSchema));

	let validation: InvitationValidationResponse;
	try {
		validation = await validateInvitation(params.token, fetch);
	} catch {
		validation = {
			valid: false,
			email: null,
			tenant_name: null,
			reason: 'invalid',
			message: null
		};
	}

	return { form, validation };
};

export const actions: Actions = {
	default: async ({ request, params, fetch }) => {
		const form = await superValidate(request, zod(acceptInvitationSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const result = await acceptInvitation(params.token, form.data.password, fetch);

			if (result.success) {
				// Backend returns /auth/login but our SvelteKit route is /login
				redirect(302, '/login');
			}

			return message(form, result.message ?? 'Failed to accept invitation', {
				status: 400 as ErrorStatus
			});
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			throw e;
		}
	}
};
