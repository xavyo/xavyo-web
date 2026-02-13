import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { updateLifecycleConfigSchema } from '$lib/schemas/lifecycle';
import { getLifecycleConfig, updateLifecycleConfig, deleteLifecycleConfig } from '$lib/api/lifecycle';
import { ApiError } from '$lib/api/client';
import type { UpdateLifecycleConfigRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	let config;
	try {
		config = await getLifecycleConfig(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load lifecycle config');
	}

	const form = await superValidate(
		{
			name: config.name,
			description: config.description ?? undefined,
			is_active: config.is_active,
			auto_assign_initial_state: config.auto_assign_initial_state
		},
		zod(updateLifecycleConfigSchema)
	);

	return { config, form };
};

export const actions: Actions = {
	update: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(updateLifecycleConfigSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const body: UpdateLifecycleConfigRequest = {
			name: form.data.name,
			description: form.data.description || undefined,
			is_active: form.data.is_active,
			auto_assign_initial_state: form.data.auto_assign_initial_state
		};

		try {
			await updateLifecycleConfig(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		return message(form, 'Configuration updated successfully');
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteLifecycleConfig(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		redirect(302, '/governance/lifecycle');
	}
};
