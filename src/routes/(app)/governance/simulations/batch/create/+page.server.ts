import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import { createBatchSimulationSchema } from '$lib/schemas/simulations';
import { createBatchSimulation } from '$lib/api/simulations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(createBatchSimulationSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createBatchSimulationSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { data } = form;

		let filterMetadataParsed: Record<string, string> | null = null;
		if (data.selection_mode === 'filter' && data.filter_metadata) {
			try {
				filterMetadataParsed = JSON.parse(data.filter_metadata) as Record<string, string>;
			} catch {
				return message(form, 'Invalid JSON in filter metadata', { status: 400 as ErrorStatus });
			}
		}

		const body: Record<string, unknown> = {
			name: data.name,
			batch_type: data.batch_type,
			selection_mode: data.selection_mode,
			user_ids:
				data.selection_mode === 'user_list' && data.user_ids
					? data.user_ids
							.split(',')
							.map((s) => s.trim())
							.filter(Boolean)
					: null,
			filter_criteria:
				data.selection_mode === 'filter'
					? {
							department: data.filter_department || null,
							status: data.filter_status || null,
							role_ids: data.filter_role_ids
								? data.filter_role_ids
										.split(',')
										.map((s) => s.trim())
										.filter(Boolean)
								: null,
							entitlement_ids: data.filter_entitlement_ids
								? data.filter_entitlement_ids
										.split(',')
										.map((s) => s.trim())
										.filter(Boolean)
								: null,
							title: data.filter_title || null,
							metadata: filterMetadataParsed
						}
					: {},
			change_spec: {
				operation: data.batch_type,
				role_id: data.change_role_id || null,
				entitlement_id: data.change_entitlement_id || null,
				justification: data.change_justification || null
			}
		};

		try {
			await createBatchSimulation(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) {
				return message(form, e.body?.message || 'Failed to create batch simulation', {
					status: e.status as ErrorStatus
				});
			}
			if (e instanceof ApiError) {
				return message(form, e.message, { status: (e.status || 500) as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 as ErrorStatus });
		}

		redirect(302, '/governance/simulations');
	}
};
