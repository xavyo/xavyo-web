import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, isRedirect, redirect } from '@sveltejs/kit';
import { acceptInvitationSchema } from '$lib/schemas/imports';
import { validateInvitation, acceptInvitation } from '$lib/api/imports';
import { ApiError } from '$lib/api/client';
import { tenantIdFromQuery } from '$lib/server/auth';
import type { InvitationValidationResponse } from '$lib/api/types';

export const load: PageServerLoad = async ({ params, url, fetch }) => {
	const form = await superValidate(zod(acceptInvitationSchema));
	// The invite link carries the tenant so the post-accept login preserves context.
	const tenant = tenantIdFromQuery(url.searchParams.get('tenant')) ?? null;

	let validation: InvitationValidationResponse;
	try {
		validation = await validateInvitation(params.token, fetch);
	} catch (e) {
		if (e instanceof ApiError && e.status >= 400 && e.status < 500) {
			validation = {
				valid: false,
				email: null,
				tenant_name: null,
				reason: 'invalid',
				message: null
			};
		} else if (e instanceof ApiError) {
			error(e.status, e.message);
		} else {
			error(500, 'Failed to validate invitation');
		}
	}

	return { form, validation, tenant };
};

export const actions: Actions = {
	default: async ({ request, params, url, fetch }) => {
		const form = await superValidate(request, zod(acceptInvitationSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const result = await acceptInvitation(params.token, form.data.password, fetch);

			if (result.success) {
				// Backend returns /auth/login but our SvelteKit route is /login.
				// Preserve the tenant so the invited user can actually authenticate
				// (a new-device accept has no tenant cookie).
				const tenant = tenantIdFromQuery(url.searchParams.get('tenant'));
				redirect(302, tenant ? `/login?tenant=${tenant}` : '/login');
			}

			return message(form, result.message ?? 'Failed to accept invitation', {
				status: 400 as ErrorStatus
			});
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			throw e;
		}
	}
};
