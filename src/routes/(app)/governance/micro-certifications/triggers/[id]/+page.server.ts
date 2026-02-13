import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { isRedirect } from '@sveltejs/kit';
import { updateTriggerRuleSchema } from '$lib/schemas/micro-certifications';
import {
	getTriggerRule,
	updateTriggerRule,
	deleteTriggerRule,
	enableTriggerRule,
	disableTriggerRule,
	setDefaultTriggerRule
} from '$lib/api/micro-certifications';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	let rule;
	try {
		rule = await getTriggerRule(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load trigger rule');
	}

	const form = await superValidate(
		{
			name: rule.name,
			trigger_type: rule.trigger_type,
			scope_type: rule.scope_type,
			scope_id: rule.scope_id ?? undefined,
			reviewer_type: rule.reviewer_type,
			specific_reviewer_id: rule.specific_reviewer_id ?? undefined,
			fallback_reviewer_id: rule.fallback_reviewer_id ?? undefined,
			timeout_secs: rule.timeout_secs ?? undefined,
			reminder_threshold_percent: rule.reminder_threshold_percent ?? undefined,
			auto_revoke: rule.auto_revoke,
			revoke_triggering_assignment: rule.revoke_triggering_assignment,
			is_default: rule.is_default,
			priority: rule.priority ?? undefined,
			metadata: rule.metadata ?? undefined
		},
		zod(updateTriggerRuleSchema)
	);

	return { rule, form };
};

export const actions: Actions = {
	update: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(updateTriggerRuleSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await updateTriggerRule(
				params.id,
				{
					name: form.data.name || undefined,
					trigger_type: form.data.trigger_type || undefined,
					scope_type: form.data.scope_type || undefined,
					scope_id: form.data.scope_id || undefined,
					reviewer_type: form.data.reviewer_type || undefined,
					specific_reviewer_id: form.data.specific_reviewer_id || undefined,
					fallback_reviewer_id: form.data.fallback_reviewer_id || undefined,
					timeout_secs: form.data.timeout_secs || undefined,
					reminder_threshold_percent: form.data.reminder_threshold_percent || undefined,
					auto_revoke: form.data.auto_revoke,
					revoke_triggering_assignment: form.data.revoke_triggering_assignment,
					is_default: form.data.is_default,
					priority: form.data.priority || undefined,
					metadata: form.data.metadata || undefined
				},
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		return message(form, 'Trigger rule updated successfully');
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteTriggerRule(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		redirect(302, '/governance/micro-certifications');
	},

	enable: async ({ params, locals, fetch }) => {
		try {
			await enableTriggerRule(params.id, locals.accessToken!, locals.tenantId!, fetch);
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
			await disableTriggerRule(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'disabled' };
	},

	setDefault: async ({ params, locals, fetch }) => {
		try {
			await setDefaultTriggerRule(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'set_default' };
	}
};
