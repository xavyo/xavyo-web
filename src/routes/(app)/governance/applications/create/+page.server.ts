import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createApplicationSchema } from '$lib/schemas/governance';
import { createApplication } from '$lib/api/governance';
import { ApiError } from '$lib/api/client';
import type { CreateApplicationRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(createApplicationSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createApplicationSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const body: CreateApplicationRequest = {
			name: form.data.name,
			app_type: form.data.app_type as 'internal' | 'external',
			description: form.data.description || undefined,
			external_id: form.data.external_id || undefined,
			is_delegable: form.data.is_delegable
		};

		try {
			await createApplication(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/governance/applications');
	}
};
