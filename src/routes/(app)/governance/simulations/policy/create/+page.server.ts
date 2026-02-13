import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import { createPolicySimulationSchema } from '$lib/schemas/simulations';
import { createPolicySimulation } from '$lib/api/simulations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(createPolicySimulationSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createPolicySimulationSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		let parsedConfig: Record<string, unknown>;
		try {
			parsedConfig = JSON.parse(form.data.policy_config) as Record<string, unknown>;
		} catch {
			return message(form, 'Invalid JSON in policy configuration', { status: 400 as ErrorStatus });
		}

		try {
			await createPolicySimulation(
				{
					name: form.data.name,
					simulation_type: form.data.simulation_type,
					policy_id: form.data.policy_id || null,
					policy_config: parsedConfig
				},
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) {
				return message(form, e.body?.message || 'Failed to create simulation', {
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
