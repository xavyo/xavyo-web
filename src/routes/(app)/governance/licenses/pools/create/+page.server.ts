import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createPoolSchema } from '$lib/schemas/licenses';
import { createLicensePool } from '$lib/api/licenses';
import { ApiError } from '$lib/api/client';
import type { CreateLicensePoolRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(createPoolSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createPoolSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		let expirationDate = form.data.expiration_date || undefined;
		if (expirationDate && !expirationDate.includes('T')) {
			expirationDate = `${expirationDate}T00:00:00Z`;
		}

		const body: CreateLicensePoolRequest = {
			name: form.data.name,
			vendor: form.data.vendor,
			description: form.data.description || undefined,
			total_capacity: form.data.total_capacity,
			cost_per_license: form.data.cost_per_license ?? undefined,
			currency: form.data.currency || undefined,
			billing_period: form.data.billing_period,
			license_type: form.data.license_type ?? undefined,
			expiration_date: expirationDate,
			expiration_policy: form.data.expiration_policy ?? undefined,
			warning_days: form.data.warning_days ?? undefined
		};

		let poolId: string;
		try {
			const pool = await createLicensePool(
				body,
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
			poolId = pool.id;
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, `/governance/licenses/pools/${poolId}`);
	}
};
