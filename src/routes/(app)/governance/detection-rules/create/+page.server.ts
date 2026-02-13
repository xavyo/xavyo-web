import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createDetectionRuleSchema } from '$lib/schemas/manual-tasks-detection-rules';
import { createDetectionRule } from '$lib/api/detection-rules';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}
	const form = await superValidate(zod(createDetectionRuleSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createDetectionRuleSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const parameters: Record<string, unknown> = {};
		if (form.data.rule_type === 'inactive' && form.data.days_threshold) {
			parameters.days_threshold = form.data.days_threshold;
		}
		if (form.data.rule_type === 'custom' && form.data.expression) {
			parameters.expression = form.data.expression;
		}

		try {
			await createDetectionRule(
				{
					name: form.data.name,
					rule_type: form.data.rule_type,
					is_enabled: form.data.is_enabled,
					priority: form.data.priority,
					parameters: Object.keys(parameters).length > 0 ? parameters : undefined,
					description: form.data.description || undefined
				},
				locals.accessToken!, locals.tenantId!, fetch
			);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/governance/detection-rules');
	}
};
