import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createEscalationPolicySchema } from '$lib/schemas/approval-workflows';
import { createEscalationPolicy } from '$lib/api/approval-workflows';
import { ApiError } from '$lib/api/client';
import type { CreateEscalationPolicyRequest, FinalFallbackAction } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}
	const form = await superValidate(zod(createEscalationPolicySchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createEscalationPolicySchema));
		if (!form.valid) return fail(400, { form });
		const body: CreateEscalationPolicyRequest = {
			name: form.data.name,
			description: form.data.description || undefined,
			default_timeout_secs: form.data.default_timeout_secs,
			warning_threshold_secs: form.data.warning_threshold_secs || undefined,
			final_fallback: form.data.final_fallback as FinalFallbackAction
		};
		let policyId: string;
		try {
			const policy = await createEscalationPolicy(
				body,
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
			policyId = policy.id;
		} catch (e) {
			if (e instanceof ApiError)
				return message(form, e.message, { status: e.status as ErrorStatus });
			return message(form, 'An unexpected error occurred', { status: 500 });
		}
		redirect(302, `/governance/approval-config/escalation-policies/${policyId}`);
	}
};
