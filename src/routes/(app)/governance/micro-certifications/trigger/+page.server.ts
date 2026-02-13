import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { redirect, fail } from '@sveltejs/kit';
import { isRedirect } from '@sveltejs/kit';
import { manualTriggerSchema } from '$lib/schemas/micro-certifications';
import { manualTriggerCertification } from '$lib/api/micro-certifications';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}
	const form = await superValidate(zod(manualTriggerSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(manualTriggerSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await manualTriggerCertification(
				{
					user_id: form.data.user_id,
					entitlement_id: form.data.entitlement_id,
					trigger_rule_id: form.data.trigger_rule_id || undefined,
					reviewer_id: form.data.reviewer_id || undefined,
					reason: form.data.reason
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
