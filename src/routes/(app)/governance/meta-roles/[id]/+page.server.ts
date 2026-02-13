import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { updateMetaRoleSchema } from '$lib/schemas/meta-roles';
import {
	getMetaRole,
	updateMetaRole,
	deleteMetaRole,
	enableMetaRole,
	disableMetaRole
} from '$lib/api/meta-roles';
import { ApiError } from '$lib/api/client';
import type { UpdateMetaRoleRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	let metaRole;
	try {
		metaRole = await getMetaRole(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load meta-role');
	}

	const form = await superValidate(
		{
			name: metaRole.name,
			description: metaRole.description ?? undefined,
			priority: metaRole.priority,
			criteria_logic: metaRole.criteria_logic
		},
		zod(updateMetaRoleSchema)
	);

	return { metaRole, form };
};

export const actions: Actions = {
	update: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(updateMetaRoleSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const body: UpdateMetaRoleRequest = {};
		if (form.data.name) body.name = form.data.name;
		if (form.data.description !== undefined) body.description = form.data.description || undefined;
		if (form.data.priority) body.priority = form.data.priority;
		if (form.data.criteria_logic) body.criteria_logic = form.data.criteria_logic;

		try {
			await updateMetaRole(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		return message(form, 'Meta-role updated successfully');
	},

	enable: async ({ params, locals, fetch }) => {
		try {
			await enableMetaRole(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'Failed to enable meta-role' });
		}
		return { success: true };
	},

	disable: async ({ params, locals, fetch }) => {
		try {
			await disableMetaRole(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'Failed to disable meta-role' });
		}
		return { success: true };
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteMetaRole(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		redirect(302, '/governance/meta-roles');
	}
};
