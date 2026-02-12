import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { createReclamationRuleSchema } from '$lib/schemas/licenses';
import { listLicensePools, createReclamationRule } from '$lib/api/licenses';
import { ApiError } from '$lib/api/client';
import type { CreateReclamationRuleRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const [form, poolsResponse] = await Promise.all([
		superValidate(zod(createReclamationRuleSchema)),
		listLicensePools({ limit: 100 }, locals.accessToken!, locals.tenantId!, fetch)
	]);

	return { form, pools: poolsResponse.items };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createReclamationRuleSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const body: CreateReclamationRuleRequest = {
			license_pool_id: form.data.license_pool_id,
			trigger_type: form.data.trigger_type,
			threshold_days: form.data.threshold_days ?? undefined,
			lifecycle_state: form.data.lifecycle_state || undefined,
			notification_days_before: form.data.notification_days_before ?? undefined
		};

		try {
			await createReclamationRule(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/governance/licenses?tab=reclamation-rules');
	}
};
