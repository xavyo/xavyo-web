import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, error, isRedirect, isHttpError } from '@sveltejs/kit';
import { updateRiskThresholdSchema } from '$lib/schemas/risk';
import {
	getRiskThreshold,
	updateRiskThreshold,
	deleteRiskThreshold,
	enableRiskThreshold,
	disableRiskThreshold
} from '$lib/api/risk';
import { ApiError } from '$lib/api/client';
import type { UpdateRiskThresholdRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	try {
		const threshold = await getRiskThreshold(
			params.id,
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		const form = await superValidate(
			{
				name: threshold.name,
				score_value: threshold.score_value,
				severity: threshold.severity,
				action: threshold.action,
				cooldown_hours: threshold.cooldown_hours,
				is_enabled: threshold.is_enabled
			},
			zod(updateRiskThresholdSchema)
		);
		return { threshold, form };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load threshold');
	}
};

export const actions: Actions = {
	update: async ({ params, request, locals, fetch }) => {
		const form = await superValidate(request, zod(updateRiskThresholdSchema));
		if (!form.valid) return fail(400, { form });

		const body: UpdateRiskThresholdRequest = {};
		if (form.data.name) body.name = form.data.name;
		if (form.data.score_value !== undefined) body.score_value = form.data.score_value;
		if (form.data.severity)
			body.severity = form.data.severity as 'info' | 'warning' | 'critical';
		if (form.data.action) body.action = form.data.action as 'alert' | 'require_mfa' | 'block';
		if (form.data.cooldown_hours !== undefined) body.cooldown_hours = form.data.cooldown_hours;
		if (form.data.is_enabled !== undefined) body.is_enabled = form.data.is_enabled;

		try {
			await updateRiskThreshold(
				params.id,
				body,
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError)
				return message(form, e.message, { status: e.status as ErrorStatus });
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		return message(form, 'Risk threshold updated successfully');
	},

	enable: async ({ params, locals, fetch }) => {
		try {
			await enableRiskThreshold(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'Failed to enable threshold' });
		}
		return { success: true, action: 'enabled' };
	},

	disable: async ({ params, locals, fetch }) => {
		try {
			await disableRiskThreshold(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'Failed to disable threshold' });
		}
		return { success: true, action: 'disabled' };
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteRiskThreshold(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'Failed to delete' });
		}
		redirect(302, '/governance/risk/thresholds');
	}
};
