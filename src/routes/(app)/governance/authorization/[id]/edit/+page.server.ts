import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, isHttpError, isRedirect, redirect } from '@sveltejs/kit';
import { updatePolicySchema } from '$lib/schemas/authorization';
import { getPolicy, updatePolicy } from '$lib/api/authorization';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { UpdatePolicyRequest } from '$lib/api/types';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	let policy;
	try {
		policy = await getPolicy(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load policy');
	}

	const form = await superValidate(
		{
			name: policy.name,
			description: policy.description ?? undefined,
			effect: policy.effect,
			priority: policy.priority,
			resource_type: policy.resource_type ?? undefined,
			action: policy.action ?? undefined
		},
		zod(updatePolicySchema)
	);

	return { policy, form };
};

export const actions: Actions = {
	default: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(updatePolicySchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const body: UpdatePolicyRequest = {
			name: form.data.name,
			description: form.data.description || undefined,
			effect: form.data.effect,
			priority: form.data.priority,
			resource_type: form.data.resource_type || undefined,
			action: form.data.action || undefined
		};

		try {
			await updatePolicy(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
			redirect(303, `/governance/authorization/${params.id}`);
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
