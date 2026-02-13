import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import { createMiningJobSchema } from '$lib/schemas/role-mining';
import { createMiningJob } from '$lib/api/role-mining';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(createMiningJobSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) {
			redirect(302, '/login');
		}

		const form = await superValidate(request, zod(createMiningJobSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const {
				name,
				min_users,
				min_entitlements,
				confidence_threshold,
				include_excessive_privilege,
				include_consolidation,
				consolidation_threshold,
				deviation_threshold,
				peer_group_attribute
			} = form.data;

			await createMiningJob(
				{
					name,
					parameters: {
						min_users,
						min_entitlements,
						confidence_threshold,
						include_excessive_privilege,
						include_consolidation,
						consolidation_threshold,
						deviation_threshold,
						peer_group_attribute: peer_group_attribute || null
					}
				},
				locals.accessToken,
				locals.tenantId,
				fetch
			);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) {
				return message(form, e.body?.message || 'Failed to create job', {
					status: e.status as ErrorStatus
				});
			}
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/governance/role-mining');
	}
};
