import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import { createSiemExportSchema } from '$lib/schemas/siem';
import { createSiemExport } from '$lib/api/siem';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { CreateSiemExportRequest } from '$lib/api/types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.accessToken || !locals.tenantId) {
		redirect(302, '/login');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/');
	}

	const form = await superValidate(zod(createSiemExportSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) {
			redirect(302, '/login');
		}

		const form = await superValidate(request, zod(createSiemExportSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const body: CreateSiemExportRequest = {
			date_range_start: form.data.date_range_start,
			date_range_end: form.data.date_range_end,
			event_type_filter:
				form.data.event_type_filter.length > 0 ? form.data.event_type_filter : undefined,
			output_format: form.data.output_format
		};

		try {
			await createSiemExport(body, locals.accessToken, locals.tenantId, fetch);
			redirect(302, '/governance/siem');
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) {
				return message(form, e.body.message ?? 'Request failed', {
					status: e.status as ErrorStatus
				});
			}
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'Failed to create export', { status: 500 as ErrorStatus });
		}
	}
};
