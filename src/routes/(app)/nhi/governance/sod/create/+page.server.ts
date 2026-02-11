import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createNhiSodRuleSchema } from '$lib/schemas/nhi-governance';
import { createNhiSodRule } from '$lib/api/nhi-governance';
import { ApiError } from '$lib/api/client';
import type { CreateNhiSodRuleRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(createNhiSodRuleSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createNhiSodRuleSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const body: CreateNhiSodRuleRequest = {
			tool_id_a: form.data.tool_id_a,
			tool_id_b: form.data.tool_id_b,
			enforcement: form.data.enforcement,
			description: form.data.description || undefined
		};

		try {
			await createNhiSodRule(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/nhi/governance');
	}
};
