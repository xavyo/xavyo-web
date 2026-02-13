import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createLifecycleConfigSchema } from '$lib/schemas/lifecycle';
import { createLifecycleConfig } from '$lib/api/lifecycle';
import { ApiError } from '$lib/api/client';
import type { CreateLifecycleConfigRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(createLifecycleConfigSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createLifecycleConfigSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const body: CreateLifecycleConfigRequest = {
			name: form.data.name,
			object_type: form.data.object_type,
			description: form.data.description || undefined,
			auto_assign_initial_state: form.data.auto_assign_initial_state
		};

		try {
			await createLifecycleConfig(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/governance/lifecycle');
	}
};
