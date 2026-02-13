import type { PageServerLoad, Actions } from './$types';
import { redirect, error, isHttpError, isRedirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { updateTicketingConfigSchema } from '$lib/schemas/governance-operations';
import { getTicketingConfig, updateTicketingConfig } from '$lib/api/governance-operations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { ErrorStatus } from 'sveltekit-superforms';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) redirect(302, '/dashboard');
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		const config = await getTicketingConfig(params.id, locals.accessToken, locals.tenantId, fetch);
		const form = await superValidate(
			{
				name: config.name,
				endpoint_url: config.endpoint_url,
				default_assignee: config.default_assignee ?? undefined,
				default_assignment_group: config.default_assignment_group ?? undefined,
				project_key: config.project_key ?? undefined,
				issue_type: config.issue_type ?? undefined,
				polling_interval_seconds: config.polling_interval_seconds,
				is_active: config.is_active
			},
			zod(updateTicketingConfigSchema)
		);
		return { config, form };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};

export const actions: Actions = {
	default: async ({ params, request, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
		const form = await superValidate(request, zod(updateTicketingConfigSchema));
		if (!form.valid) return message(form, 'Please fix the errors', { status: 400 as ErrorStatus });
		try {
			await updateTicketingConfig(params.id, form.data as Parameters<typeof updateTicketingConfig>[1], locals.accessToken, locals.tenantId, fetch);
			redirect(303, `/governance/operations/ticketing/${params.id}`);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) return message(form, e.message, { status: e.status as ErrorStatus });
			throw e;
		}
	}
};
