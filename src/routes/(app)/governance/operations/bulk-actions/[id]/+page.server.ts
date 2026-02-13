import type { PageServerLoad, Actions } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import { updateBulkActionSchema } from '$lib/schemas/governance-operations';
import { getBulkAction, updateBulkAction } from '$lib/api/governance-operations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const bulkAction = await getBulkAction(
			params.id,
			locals.accessToken,
			locals.tenantId,
			fetch
		);

		const form = await superValidate(
			{
				filter_expression: bulkAction.filter_expression,
				action_type: bulkAction.action_type,
				action_params: typeof bulkAction.action_params === 'string'
					? bulkAction.action_params
					: JSON.stringify(bulkAction.action_params ?? {}),
				justification: bulkAction.justification
			},
			zod(updateBulkActionSchema)
		);

		return { bulkAction, form };
	} catch (e) {
		if (e instanceof ApiError) {
			if (e.status === 404) {
				error(404, 'Bulk action not found');
			}
			error(e.status, e.message);
		}
		throw e;
	}
};

export const actions: Actions = {
	edit: async ({ params, request, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

		const form = await superValidate(request, zod(updateBulkActionSchema));
		if (!form.valid) {
			return message(form, 'Please fix the errors', { status: 400 as ErrorStatus });
		}

		try {
			let parsedParams: unknown;
			try {
				parsedParams = JSON.parse(form.data.action_params) as Record<string, unknown>;
			} catch {
				return message(form, 'Invalid JSON in action params', { status: 400 as ErrorStatus });
			}

			await updateBulkAction(
				params.id,
				{
					filter_expression: form.data.filter_expression,
					action_type: form.data.action_type,
					action_params: parsedParams,
					justification: form.data.justification
				},
				locals.accessToken,
				locals.tenantId,
				fetch
			);
			redirect(303, `/governance/operations/bulk-actions/${params.id}`);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			throw e;
		}
	}
};
