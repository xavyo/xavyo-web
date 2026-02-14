import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import { createRiskFactorSchema } from '$lib/schemas/risk';
import { createRiskFactor } from '$lib/api/risk';
import { ApiError } from '$lib/api/client';
import type { CreateRiskFactorRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}
	const form = await superValidate(zod(createRiskFactorSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createRiskFactorSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const body: CreateRiskFactorRequest = {
			name: form.data.name,
			category: form.data.category as 'static' | 'dynamic',
			factor_type: form.data.factor_type,
			weight: form.data.weight,
			description: form.data.description || undefined,
			is_enabled: form.data.is_enabled
		};

		try {
			await createRiskFactor(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/governance/risk/factors');
	}
};
