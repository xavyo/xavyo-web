import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { submitNhiRequestSchema } from '$lib/schemas/nhi-requests';
import { submitNhiRequest } from '$lib/api/nhi-requests';
import { redirect } from '@sveltejs/kit';
import { isRedirect, isHttpError } from '@sveltejs/kit';
import { ApiError } from '$lib/api/client';
import type { ErrorStatus } from 'sveltekit-superforms';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(submitNhiRequestSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(submitNhiRequestSchema));
		if (!form.valid) return message(form, 'Please fix the errors below', { status: 400 as ErrorStatus });
		if (!locals.accessToken || !locals.tenantId) return message(form, 'Unauthorized', { status: 401 as ErrorStatus });

		try {
			const body: Record<string, unknown> = {
				name: form.data.name,
				purpose: form.data.purpose
			};
			if (form.data.requested_permissions) {
				const perms = form.data.requested_permissions.split(',').map((s) => s.trim()).filter(Boolean);
				if (perms.length > 0) body.requested_permissions = perms;
			}
			if (form.data.requested_expiration) body.requested_expiration = form.data.requested_expiration;
			if (form.data.rotation_interval_days) body.rotation_interval_days = form.data.rotation_interval_days;

			await submitNhiRequest(body as any, locals.accessToken, locals.tenantId, fetch);
			redirect(303, '/nhi/requests');
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) return message(form, e.body?.message ?? 'Request failed', { status: e.status as ErrorStatus });
			if (e instanceof ApiError) return message(form, e.message, { status: e.status as ErrorStatus });
			return message(form, 'Failed to submit request', { status: 500 as ErrorStatus });
		}
	}
};
