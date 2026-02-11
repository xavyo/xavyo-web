import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createExemptionSchema } from '$lib/schemas/approval-workflows';
import { createSodExemption } from '$lib/api/approval-workflows';
import { listSodRules } from '$lib/api/governance';
import { ApiError } from '$lib/api/client';
import type { CreateSodExemptionRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	let rules = { items: [] as Awaited<ReturnType<typeof listSodRules>>['items'], total: 0, limit: 100, offset: 0 };
	try {
		rules = await listSodRules({ limit: 100 }, locals.accessToken!, locals.tenantId!, fetch);
	} catch { /* Non-fatal */ }

	const form = await superValidate(zod(createExemptionSchema));
	return { form, rules: rules.items };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createExemptionSchema));
		if (!form.valid) return fail(400, { form });
		const body: CreateSodExemptionRequest = {
			rule_id: form.data.rule_id,
			user_id: form.data.user_id,
			justification: form.data.justification,
			expires_at: form.data.expires_at.includes('T') ? form.data.expires_at : form.data.expires_at + 'T00:00:00Z'
		};
		try {
			await createSodExemption(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) return message(form, e.message, { status: e.status as ErrorStatus });
			return message(form, 'An unexpected error occurred', { status: 500 });
		}
		redirect(302, '/governance');
	}
};
