import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createMetaRoleSchema } from '$lib/schemas/meta-roles';
import { createMetaRole } from '$lib/api/meta-roles';
import { ApiError } from '$lib/api/client';
import type { CreateMetaRoleRequest, CriteriaOperator } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(createMetaRoleSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		// Parse formData once, use for both superValidate and criteria extraction
		const formData = await request.formData();
		const form = await superValidate(formData, zod(createMetaRoleSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		// Parse criteria from hidden form fields
		const criteriaFields = formData.getAll('criteria_field') as string[];
		const criteriaOperators = formData.getAll('criteria_operator') as string[];
		const criteriaValues = formData.getAll('criteria_value') as string[];

		const criteria: { field: string; operator: CriteriaOperator; value: unknown }[] = [];
		for (let i = 0; i < criteriaFields.length; i++) {
			if (criteriaFields[i] && criteriaOperators[i] && criteriaValues[i]) {
				let value: unknown = criteriaValues[i];
				// Try parsing as JSON for array operators (in, not_in)
				if (criteriaOperators[i] === 'in' || criteriaOperators[i] === 'not_in') {
					try {
						value = JSON.parse(criteriaValues[i]);
					} catch {
						// Keep as string if not valid JSON
					}
				}
				criteria.push({
					field: criteriaFields[i],
					operator: criteriaOperators[i] as CriteriaOperator,
					value
				});
			}
		}

		if (criteria.length === 0) {
			return message(form, 'At least one criterion is required', { status: 400 as ErrorStatus });
		}

		const body: CreateMetaRoleRequest = {
			name: form.data.name,
			description: form.data.description || undefined,
			priority: form.data.priority,
			criteria_logic: form.data.criteria_logic,
			criteria
		};

		let result;
		try {
			result = await createMetaRole(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, `/governance/meta-roles/${result.id}`);
	}
};
