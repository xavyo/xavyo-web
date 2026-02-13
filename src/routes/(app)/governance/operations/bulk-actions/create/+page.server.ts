import type { PageServerLoad, Actions } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import { createBulkActionSchema } from '$lib/schemas/governance-operations';
import { createBulkAction } from '$lib/api/governance-operations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(createBulkActionSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createBulkActionSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			let parsedParams: unknown;
			try {
				parsedParams = JSON.parse(form.data.action_params);
			} catch {
				return message(form, 'Action params must be valid JSON', { status: 400 as ErrorStatus });
			}

			await createBulkAction(
				{
					filter_expression: form.data.filter_expression,
					action_type: form.data.action_type,
					action_params: parsedParams,
					justification: form.data.justification
				},
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
			redirect(302, '/governance/operations');
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}
	}
};
