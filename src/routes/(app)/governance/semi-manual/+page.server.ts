import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { hasAdminRole } from '$lib/server/auth';
import { listSemiManualApplications, configureSemiManual, removeSemiManualConfig } from '$lib/api/semi-manual';
import { configureSemiManualSchema } from '$lib/schemas/manual-tasks-detection-rules';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const applications = await listSemiManualApplications(
		{ limit, offset },
		locals.accessToken!, locals.tenantId!, fetch
	).catch(() => ({ items: [], total: 0, limit, offset }));

	const form = await superValidate(zod(configureSemiManualSchema));

	return { applications, form };
};

export const actions: Actions = {
	configure: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(configureSemiManualSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const formData = await request.clone().formData();
		const applicationId = formData.get('application_id') as string;

		if (!applicationId) {
			return message(form, 'Application ID is required', { status: 400 as ErrorStatus });
		}

		try {
			await configureSemiManual(
				applicationId,
				{
					is_semi_manual: form.data.is_semi_manual,
					ticketing_config_id: form.data.ticketing_config_id ?? undefined,
					sla_policy_id: form.data.sla_policy_id ?? undefined,
					requires_approval_before_ticket: form.data.requires_approval_before_ticket
				},
				locals.accessToken!, locals.tenantId!, fetch
			);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		return message(form, 'Application configured successfully');
	},

	remove: async ({ request, locals, fetch }) => {
		const formData = await request.formData();
		const applicationId = formData.get('application_id') as string;

		if (!applicationId) {
			return fail(400, { error: 'Application ID is required' });
		}

		try {
			await removeSemiManualConfig(applicationId, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'Failed to remove configuration' });
		}

		return { success: true, action: 'removed' };
	}
};
