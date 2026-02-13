import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { updateDetectionRuleSchema } from '$lib/schemas/manual-tasks-detection-rules';
import { getDetectionRule, updateDetectionRule } from '$lib/api/detection-rules';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	let rule;
	try {
		rule = await getDetectionRule(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load detection rule');
	}

	const form = await superValidate(
		{
			name: rule.name,
			is_enabled: rule.is_enabled,
			priority: rule.priority,
			days_threshold: (rule.parameters?.days_threshold as number) ?? undefined,
			expression: (rule.parameters?.expression as string) ?? undefined,
			description: rule.description ?? undefined
		},
		zod(updateDetectionRuleSchema)
	);

	return { rule, form };
};

export const actions: Actions = {
	default: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(updateDetectionRuleSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const parameters: Record<string, unknown> = {};
		if (form.data.days_threshold) parameters.days_threshold = form.data.days_threshold;
		if (form.data.expression) parameters.expression = form.data.expression;

		try {
			await updateDetectionRule(
				params.id,
				{
					name: form.data.name,
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

		redirect(302, `/governance/detection-rules/${params.id}`);
	}
};
