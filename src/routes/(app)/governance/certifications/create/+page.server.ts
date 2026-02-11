import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createCampaignSchema } from '$lib/schemas/governance';
import { createCampaign } from '$lib/api/governance';
import { ApiError } from '$lib/api/client';
import type { CreateCampaignRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(createCampaignSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createCampaignSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const scopeConfig: Record<string, string> = {};
		if (form.data.scope_config_department)
			scopeConfig.department = form.data.scope_config_department;
		if (form.data.scope_config_application_id)
			scopeConfig.application_id = form.data.scope_config_application_id;
		if (form.data.scope_config_entitlement_id)
			scopeConfig.entitlement_id = form.data.scope_config_entitlement_id;

		const body: CreateCampaignRequest = {
			name: form.data.name,
			description: form.data.description || undefined,
			scope_type: form.data.scope_type as any,
			scope_config: Object.keys(scopeConfig).length > 0 ? scopeConfig : undefined,
			reviewer_type: form.data.reviewer_type as any,
			deadline: form.data.deadline
		};

		try {
			await createCampaign(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/governance');
	}
};
