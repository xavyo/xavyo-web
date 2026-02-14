import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import { createRiskThresholdSchema } from '$lib/schemas/risk';
import { createRiskThreshold } from '$lib/api/risk';
import { ApiError } from '$lib/api/client';
import type { CreateRiskThresholdRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}
	const form = await superValidate(zod(createRiskThresholdSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createRiskThresholdSchema));
		if (!form.valid) return fail(400, { form });

		const body: CreateRiskThresholdRequest = {
			name: form.data.name,
			score_value: form.data.score_value,
			severity: form.data.severity as 'info' | 'warning' | 'critical',
			action: form.data.action as 'alert' | 'require_mfa' | 'block' | undefined,
			cooldown_hours: form.data.cooldown_hours || undefined,
			is_enabled: form.data.is_enabled
		};

		try {
			await createRiskThreshold(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError)
				return message(form, e.message, { status: e.status as ErrorStatus });
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/governance/risk/thresholds');
	}
};
