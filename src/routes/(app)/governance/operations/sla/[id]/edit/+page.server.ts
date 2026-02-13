import type { PageServerLoad, Actions } from './$types';
import { redirect, error, isHttpError, isRedirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { updateSlaPolicySchema } from '$lib/schemas/governance-operations';
import { getSlaPolicy, updateSlaPolicy } from '$lib/api/governance-operations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { ErrorStatus } from 'sveltekit-superforms';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const policy = await getSlaPolicy(params.id, locals.accessToken, locals.tenantId, fetch);
		const form = await superValidate(
			{
				name: policy.name,
				description: policy.description ?? undefined,
				target_duration_seconds: policy.target_duration_seconds,
				warning_threshold_percent: policy.warning_threshold_percent,
				breach_notification_enabled: policy.breach_notification_enabled
			},
			zod(updateSlaPolicySchema)
		);
		return { policy, form };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};

export const actions: Actions = {
	default: async ({ params, request, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) {
			error(401, 'Unauthorized');
		}

		const form = await superValidate(request, zod(updateSlaPolicySchema));
		if (!form.valid) return message(form, 'Please fix the errors', { status: 400 as ErrorStatus });

		try {
			await updateSlaPolicy(params.id, form.data as Parameters<typeof updateSlaPolicy>[1], locals.accessToken, locals.tenantId, fetch);
			redirect(303, `/governance/operations/sla/${params.id}`);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			throw e;
		}
	}
};
