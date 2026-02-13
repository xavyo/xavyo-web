import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { updateRoleSchema } from '$lib/schemas/governance-roles';
import { getRole, updateRole, deleteRole, listRoles } from '$lib/api/governance-roles';
import { ApiError } from '$lib/api/client';
import type { UpdateGovernanceRoleRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	let role;
	try {
		role = await getRole(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load role');
	}

	const form = await superValidate(
		{
			name: role.name,
			description: role.description ?? undefined,
			is_abstract: role.is_abstract,
			version: role.version
		},
		zod(updateRoleSchema)
	);

	// Load roles for move parent selection (exclude self)
	let availableRoles: { id: string; name: string }[] = [];
	try {
		const result = await listRoles({ limit: 100 }, locals.accessToken!, locals.tenantId!, fetch);
		availableRoles = result.items
			.filter((r) => r.id !== params.id)
			.map((r) => ({ id: r.id, name: r.name }));
	} catch {
		// If roles fail to load, move selector will be empty
	}

	return { role, form, availableRoles };
};

export const actions: Actions = {
	update: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(updateRoleSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const body: UpdateGovernanceRoleRequest = {
			name: form.data.name,
			description: form.data.description || undefined,
			is_abstract: form.data.is_abstract,
			version: form.data.version
		};

		try {
			await updateRole(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				if (e.status === 409) {
					return message(
						form,
						'This role was modified by another user. Please reload the page.',
						{ status: 409 as ErrorStatus }
					);
				}
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		return message(form, 'Role updated successfully');
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteRole(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		redirect(302, '/governance/roles');
	}
};
