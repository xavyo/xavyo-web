import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import { createComparisonSchema } from '$lib/schemas/simulations';
import {
	listPolicySimulations,
	listBatchSimulations,
	createSimulationComparison
} from '$lib/api/simulations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const [form, policyData, batchData] = await Promise.all([
		superValidate(zod(createComparisonSchema)),
		listPolicySimulations(
			{ limit: 100, offset: 0 },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		).catch(() => ({ items: [], total: 0, limit: 100, offset: 0 })),
		listBatchSimulations(
			{ limit: 100, offset: 0 },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		).catch(() => ({ items: [], total: 0, limit: 100, offset: 0 }))
	]);

	return {
		form,
		policySimulations: policyData.items,
		batchSimulations: batchData.items
	};
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createComparisonSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { data } = form;

		try {
			await createSimulationComparison(
				{
					name: data.name,
					comparison_type: data.comparison_type,
					simulation_a_id: data.simulation_a_id,
					simulation_a_type: data.simulation_a_type,
					simulation_b_id:
						data.comparison_type === 'simulation_vs_simulation'
							? data.simulation_b_id ?? null
							: null,
					simulation_b_type:
						data.comparison_type === 'simulation_vs_simulation'
							? data.simulation_b_type ?? null
							: null
				},
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) {
				return message(form, e.body?.message || 'Failed to create comparison', {
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
