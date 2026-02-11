import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createRoleSchema } from '$lib/schemas/governance-roles';
import { createRole, listRoles } from '$lib/api/governance-roles';
import { ApiError } from '$lib/api/client';
import type { CreateGovernanceRoleRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(createRoleSchema));

	// Load existing roles for parent selection
	let parentRoles: { id: string; name: string }[] = [];
	try {
		const result = await listRoles({ limit: 100 }, locals.accessToken!, locals.tenantId!, fetch);
		parentRoles = result.items.map((r) => ({ id: r.id, name: r.name }));
	} catch {
		// If roles fail to load, parent selector will be empty
	}

	return { form, parentRoles };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createRoleSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const body: CreateGovernanceRoleRequest = {
			name: form.data.name,
			description: form.data.description || undefined,
			parent_role_id: form.data.parent_id || undefined
		};

		try {
			await createRole(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/governance/roles');
	}
};
