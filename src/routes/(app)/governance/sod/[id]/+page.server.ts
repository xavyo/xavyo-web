import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { updateSodRuleSchema } from '$lib/schemas/governance';
import {
	getSodRule,
	updateSodRule,
	deleteSodRule,
	enableSodRule,
	disableSodRule
} from '$lib/api/governance';
import { ApiError } from '$lib/api/client';
import type { UpdateSodRuleRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	let rule;
	try {
		rule = await getSodRule(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load SoD rule');
	}

	const form = await superValidate(
		{
			name: rule.name,
			description: rule.description ?? undefined,
			first_entitlement_id: rule.first_entitlement_id,
			second_entitlement_id: rule.second_entitlement_id,
			severity: rule.severity,
			business_rationale: rule.business_rationale ?? undefined
		},
		zod(updateSodRuleSchema)
	);

	return { rule, form };
};

export const actions: Actions = {
	update: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(updateSodRuleSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const body: UpdateSodRuleRequest = {
			name: form.data.name || undefined,
			description: form.data.description || undefined,
			first_entitlement_id: form.data.first_entitlement_id || undefined,
			second_entitlement_id: form.data.second_entitlement_id || undefined,
			severity: (form.data.severity as UpdateSodRuleRequest['severity']) || undefined,
			business_rationale: form.data.business_rationale || undefined
		};

		try {
			await updateSodRule(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		return message(form, 'SoD rule updated successfully');
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteSodRule(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		redirect(302, '/governance');
	},

	enable: async ({ params, locals, fetch }) => {
		try {
			await enableSodRule(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'enabled' };
	},

	disable: async ({ params, locals, fetch }) => {
		try {
			await disableSodRule(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'disabled' };
	}
};
