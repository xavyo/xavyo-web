import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { updateEscalationPolicySchema, addLevelSchema } from '$lib/schemas/approval-workflows';
import {
	getEscalationPolicy,
	updateEscalationPolicy,
	deleteEscalationPolicy,
	setDefaultEscalationPolicy,
	addEscalationLevel,
	removeEscalationLevel
} from '$lib/api/approval-workflows';
import { ApiError } from '$lib/api/client';
import type {
	UpdateEscalationPolicyRequest,
	AddEscalationLevelRequest,
	EscalationTargetType
} from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}
	let policy;
	try {
		policy = await getEscalationPolicy(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load escalation policy');
	}

	const editForm = await superValidate(
		{
			name: policy.name,
			description: policy.description ?? undefined,
			default_timeout_secs: policy.default_timeout_secs,
			warning_threshold_secs: policy.warning_threshold_secs ?? undefined,
			final_fallback: policy.final_fallback
		},
		zod(updateEscalationPolicySchema)
	);
	const levelForm = await superValidate(zod(addLevelSchema));

	return { policy, editForm, levelForm };
};

export const actions: Actions = {
	edit: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(updateEscalationPolicySchema));
		if (!form.valid) return fail(400, { editForm: form });
		const body: UpdateEscalationPolicyRequest = {
			name: form.data.name || undefined,
			description: form.data.description || undefined,
			default_timeout_secs: form.data.default_timeout_secs || undefined,
			warning_threshold_secs: form.data.warning_threshold_secs || undefined,
			final_fallback: form.data.final_fallback || undefined
		};
		try {
			await updateEscalationPolicy(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError)
				return message(form, e.message, { status: e.status as ErrorStatus });
			return message(form, 'An unexpected error occurred', { status: 500 });
		}
		return message(form, 'Policy updated successfully');
	},

	setDefault: async ({ params, locals, fetch }) => {
		try {
			await setDefaultEscalationPolicy(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'setDefault' };
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteEscalationPolicy(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'An unexpected error occurred' });
		}
		redirect(302, '/governance/approval-config');
	},

	addLevel: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(addLevelSchema));
		if (!form.valid) return fail(400, { levelForm: form });
		const body: AddEscalationLevelRequest = {
			level_order: form.data.level_order,
			level_name: form.data.level_name || undefined,
			timeout_secs: form.data.timeout_secs,
			target_type: form.data.target_type as EscalationTargetType,
			target_id: form.data.target_id || undefined,
			manager_chain_depth: form.data.manager_chain_depth || undefined
		};
		try {
			await addEscalationLevel(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError)
				return message(form, e.message, { status: e.status as ErrorStatus });
			return message(form, 'An unexpected error occurred', { status: 500 });
		}
		return message(form, 'Level added successfully');
	},

	removeLevel: async ({ request, params, locals, fetch }) => {
		const formData = await request.formData();
		const levelId = formData.get('level_id') as string;
		try {
			await removeEscalationLevel(params.id, levelId, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'removeLevel' };
	}
};
