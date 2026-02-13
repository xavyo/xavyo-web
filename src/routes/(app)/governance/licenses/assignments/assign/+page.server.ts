import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { assignLicenseSchema } from '$lib/schemas/licenses';
import { createLicenseAssignment, listLicensePools } from '$lib/api/licenses';
import { ApiError } from '$lib/api/client';
import type { AssignLicenseRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const [form, poolsResponse] = await Promise.all([
		superValidate(zod(assignLicenseSchema)),
		listLicensePools({ limit: 100 }, locals.accessToken!, locals.tenantId!, fetch)
	]);

	return { form, pools: poolsResponse.items };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(assignLicenseSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const body: AssignLicenseRequest = {
			license_pool_id: form.data.license_pool_id,
			user_id: form.data.user_id,
			source: form.data.source || undefined,
			notes: form.data.notes || undefined
		};

		try {
			await createLicenseAssignment(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/governance/licenses?tab=assignments');
	}
};
