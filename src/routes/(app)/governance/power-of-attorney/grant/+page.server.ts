import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { grantPoaSchema } from '$lib/schemas/power-of-attorney';
import { grantPoa } from '$lib/api/power-of-attorney';
import { listUsers } from '$lib/api/users';
import { ApiError } from '$lib/api/client';
import type { GrantPoaRequest } from '$lib/api/types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	const form = await superValidate(zod(grantPoaSchema));

	let users: { id: string; email: string; name: string }[] = [];
	try {
		const result = await listUsers(
			{ limit: 100, offset: 0 },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		users = (result.users ?? []).map((u: any) => ({
			id: u.id,
			email: u.email,
			name: (u as any).display_name ?? u.email
		}));
	} catch {
		// Users list may fail; form will still work with manual UUID entry
	}

	return { form, users, currentUserId: locals.user?.id };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(grantPoaSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		// Build scope from comma-separated strings
		const applicationIds = form.data.scope_application_ids
			? form.data.scope_application_ids.split(',').map((s: string) => s.trim()).filter(Boolean)
			: [];
		const workflowTypes = form.data.scope_workflow_types
			? form.data.scope_workflow_types.split(',').map((s: string) => s.trim()).filter(Boolean)
			: [];

		const body: GrantPoaRequest = {
			attorney_id: form.data.attorney_id,
			starts_at: new Date(form.data.starts_at).toISOString(),
			ends_at: new Date(form.data.ends_at).toISOString(),
			reason: form.data.reason || undefined,
			scope: applicationIds.length > 0 || workflowTypes.length > 0
				? { application_ids: applicationIds, workflow_types: workflowTypes }
				: undefined
		};

		try {
			await grantPoa(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/governance/power-of-attorney');
	}
};
