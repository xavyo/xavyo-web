import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { createDelegationSchema } from '$lib/schemas/nhi-delegations';
import { createDelegationGrant } from '$lib/api/nhi-delegations';
import type { CreateDelegationGrantRequest } from '$lib/api/types';
import { redirect } from '@sveltejs/kit';
import { isRedirect, isHttpError } from '@sveltejs/kit';
import { ApiError } from '$lib/api/client';
import type { ErrorStatus } from 'sveltekit-superforms';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(createDelegationSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createDelegationSchema));
		if (!form.valid) return message(form, 'Please fix the errors below', { status: 400 as ErrorStatus });
		if (!locals.accessToken || !locals.tenantId) return message(form, 'Unauthorized', { status: 401 as ErrorStatus });

		try {
			const allowed_scopes = form.data.allowed_scopes
				? form.data.allowed_scopes.split(',').map((s) => s.trim()).filter(Boolean)
				: [];
			const allowed_resource_types = form.data.allowed_resource_types
				? form.data.allowed_resource_types.split(',').map((s) => s.trim()).filter(Boolean)
				: [];

			const body: CreateDelegationGrantRequest = {
				principal_id: form.data.principal_id,
				principal_type: form.data.principal_type as 'user' | 'nhi',
				actor_nhi_id: form.data.actor_nhi_id,
				allowed_scopes,
				allowed_resource_types,
				...(form.data.max_delegation_depth ? { max_delegation_depth: form.data.max_delegation_depth } : {}),
				...(form.data.expires_at ? { expires_at: form.data.expires_at } : {})
			};

			await createDelegationGrant(body, locals.accessToken, locals.tenantId, fetch);
			redirect(303, '/nhi/delegations');
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) return message(form, e.body?.message ?? 'Request failed', { status: e.status as ErrorStatus });
			if (e instanceof ApiError) return message(form, e.message, { status: e.status as ErrorStatus });
			return message(form, 'Failed to create delegation grant', { status: 500 as ErrorStatus });
		}
	}
};
