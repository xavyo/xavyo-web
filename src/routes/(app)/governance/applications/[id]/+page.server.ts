import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { updateApplicationSchema } from '$lib/schemas/governance';
import { getApplication, updateApplication, deleteApplication } from '$lib/api/governance';
import { ApiError } from '$lib/api/client';
import type { UpdateApplicationRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	let application;
	try {
		application = await getApplication(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load application');
	}

	const form = await superValidate(
		{
			name: application.name,
			status: application.status,
			description: application.description ?? undefined,
			external_id: application.external_id ?? undefined,
			is_delegable: application.is_delegable
		},
		zod(updateApplicationSchema)
	);

	return { application, form };
};

export const actions: Actions = {
	update: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(updateApplicationSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const body: UpdateApplicationRequest = {
			name: form.data.name || undefined,
			status: (form.data.status as 'active' | 'inactive') || undefined,
			description: form.data.description || undefined,
			external_id: form.data.external_id || undefined,
			is_delegable: form.data.is_delegable
		};

		try {
			await updateApplication(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		return message(form, 'Application updated successfully');
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteApplication(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				if (e.status === 412) {
					return fail(412, {
						error:
							'Cannot delete this application because it has associated entitlements. Remove all entitlements first.'
					});
				}
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		redirect(302, '/governance/applications');
	}
};
