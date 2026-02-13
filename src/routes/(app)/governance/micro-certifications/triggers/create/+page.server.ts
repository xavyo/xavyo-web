import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { redirect, fail } from '@sveltejs/kit';
import { isRedirect } from '@sveltejs/kit';
import { createTriggerRuleSchema } from '$lib/schemas/micro-certifications';
import { createTriggerRule } from '$lib/api/micro-certifications';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}
	const form = await superValidate(zod(createTriggerRuleSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createTriggerRuleSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await createTriggerRule(
				{
					name: form.data.name,
					trigger_type: form.data.trigger_type,
					scope_type: form.data.scope_type,
					scope_id: form.data.scope_id || undefined,
					reviewer_type: form.data.reviewer_type,
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
			redirect(302, '/governance/micro-certifications');
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}
	}
};
