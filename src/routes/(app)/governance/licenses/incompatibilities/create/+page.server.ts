import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createIncompatibilitySchema } from '$lib/schemas/licenses';
import { listLicensePools, createLicenseIncompatibility } from '$lib/api/licenses';
import { ApiError } from '$lib/api/client';
import type { CreateLicenseIncompatibilityRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const [form, poolsResponse] = await Promise.all([
		superValidate(zod(createIncompatibilitySchema)),
		listLicensePools({ limit: 100 }, locals.accessToken!, locals.tenantId!, fetch)
	]);

	return { form, pools: poolsResponse.items };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createIncompatibilitySchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		if (form.data.pool_a_id === form.data.pool_b_id) {
			return message(form, 'Pool A and Pool B must be different pools', {
				status: 400 as ErrorStatus
			});
		}

		const body: CreateLicenseIncompatibilityRequest = {
			pool_a_id: form.data.pool_a_id,
			pool_b_id: form.data.pool_b_id,
			reason: form.data.reason
		};

		try {
			await createLicenseIncompatibility(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/governance/licenses?tab=incompatibilities');
	}
};
