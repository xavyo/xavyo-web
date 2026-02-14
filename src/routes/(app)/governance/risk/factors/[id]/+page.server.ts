import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, error, isRedirect, isHttpError } from '@sveltejs/kit';
import { updateRiskFactorSchema } from '$lib/schemas/risk';
import { getRiskFactor, updateRiskFactor, deleteRiskFactor } from '$lib/api/risk';
import { ApiError } from '$lib/api/client';
import type { UpdateRiskFactorRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	try {
		const factor = await getRiskFactor(params.id, locals.accessToken!, locals.tenantId!, fetch);
		const form = await superValidate(
			{
				name: factor.name,
				category: factor.category,
				factor_type: factor.factor_type,
				weight: factor.weight,
				description: factor.description ?? '',
				is_enabled: factor.is_enabled
			},
			zod(updateRiskFactorSchema)
		);
		return { factor, form };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load factor');
	}
};

export const actions: Actions = {
	update: async ({ params, request, locals, fetch }) => {
		const form = await superValidate(request, zod(updateRiskFactorSchema));
		if (!form.valid) return fail(400, { form });

		const body: UpdateRiskFactorRequest = {};
		if (form.data.name) body.name = form.data.name;
		if (form.data.category) body.category = form.data.category as 'static' | 'dynamic';
		if (form.data.factor_type) body.factor_type = form.data.factor_type;
		if (form.data.weight !== undefined) body.weight = form.data.weight;
		if (form.data.description !== undefined)
			body.description = form.data.description || undefined;
		if (form.data.is_enabled !== undefined) body.is_enabled = form.data.is_enabled;

		try {
			await updateRiskFactor(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		return message(form, 'Risk factor updated successfully');
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteRiskFactor(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'Failed to delete' });
		}
		redirect(302, '/governance/risk/factors');
	}
};
