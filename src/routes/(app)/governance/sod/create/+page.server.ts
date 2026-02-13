import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createSodRuleSchema } from '$lib/schemas/governance';
import { createSodRule } from '$lib/api/governance';
import { ApiError } from '$lib/api/client';
import type { CreateSodRuleRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(createSodRuleSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createSodRuleSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const body: CreateSodRuleRequest = {
			name: form.data.name,
			description: form.data.description || undefined,
			first_entitlement_id: form.data.first_entitlement_id,
			second_entitlement_id: form.data.second_entitlement_id,
			severity: form.data.severity as CreateSodRuleRequest['severity'],
			business_rationale: form.data.business_rationale || undefined
		};

		try {
			await createSodRule(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/governance');
	}
};
