import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createPolicySchema } from '$lib/schemas/authorization';
import { createPolicy } from '$lib/api/authorization';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { CreatePolicyRequest, CreateConditionRequest, ConditionType, ConditionOperator } from '$lib/api/types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}
	const form = await superValidate(zod(createPolicySchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const clonedRequest = request.clone();
		const form = await superValidate(request, zod(createPolicySchema));
		if (!form.valid) return fail(400, { form });

		const formData = await clonedRequest.formData();

		// Parse conditions from parallel arrays in hidden form fields
		const conditionTypes = formData.getAll('condition_type') as string[];
		const conditionPaths = formData.getAll('condition_attribute_path') as string[];
		const conditionOperators = formData.getAll('condition_operator') as string[];
		const conditionValues = formData.getAll('condition_value') as string[];

		const conditions: CreateConditionRequest[] = [];
		for (let i = 0; i < conditionTypes.length; i++) {
			if (!conditionTypes[i]) continue;
			const condition: CreateConditionRequest = {
				condition_type: conditionTypes[i] as ConditionType,
				value: conditionValues[i] || ''
			};
			if (conditionPaths[i]) {
				condition.attribute_path = conditionPaths[i];
			}
			if (conditionOperators[i]) {
				condition.operator = conditionOperators[i] as ConditionOperator;
			}
			conditions.push(condition);
		}

		const body: CreatePolicyRequest = {
			name: form.data.name,
			description: form.data.description || undefined,
			effect: form.data.effect,
			priority: form.data.priority,
			resource_type: form.data.resource_type,
			action: form.data.action
		};

		if (conditions.length > 0) {
			body.conditions = conditions;
		}

		try {
			const policy = await createPolicy(body, locals.accessToken!, locals.tenantId!, fetch);
			redirect(302, `/governance/authorization/${policy.id}`);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			throw e;
		}
	}
};
