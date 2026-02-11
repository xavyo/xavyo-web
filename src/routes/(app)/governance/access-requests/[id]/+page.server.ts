import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { approveRequestSchema, rejectRequestSchema } from '$lib/schemas/governance';
import {
	getAccessRequest,
	approveAccessRequest,
	rejectAccessRequest
} from '$lib/api/access-requests';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	let request;
	try {
		request = await getAccessRequest(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError && e.status === 404) {
			redirect(302, '/governance');
		}
		throw e;
	}

	const approveForm = await superValidate(zod(approveRequestSchema));
	const rejectForm = await superValidate(zod(rejectRequestSchema));

	return { request, approveForm, rejectForm };
};

export const actions: Actions = {
	approve: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(approveRequestSchema));

		if (!form.valid) {
			return fail(400, { approveForm: form });
		}

		try {
			await approveAccessRequest(
				params.id,
				{ comments: form.data.comments || undefined },
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

		redirect(302, '/governance');
	},

	reject: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(rejectRequestSchema));

		if (!form.valid) {
			return fail(400, { rejectForm: form });
		}

		try {
			await rejectAccessRequest(
				params.id,
				{ comments: form.data.comments },
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

		redirect(302, '/governance');
	}
};
