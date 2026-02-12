import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, isRedirect, redirect } from '@sveltejs/kit';
import { updatePoolSchema } from '$lib/schemas/licenses';
import {
	getLicensePool,
	updateLicensePool,
	archiveLicensePool,
	deleteLicensePool
} from '$lib/api/licenses';
import { ApiError } from '$lib/api/client';
import type { UpdateLicensePoolRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	let pool;
	try {
		pool = await getLicensePool(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load license pool');
	}

	// Pre-fill the form with existing pool data
	// Handle expiration_date: split off time portion if present (for date input)
	let expirationDate = pool.expiration_date ?? undefined;
	if (expirationDate && expirationDate.includes('T')) {
		expirationDate = expirationDate.split('T')[0];
	}

	const form = await superValidate(
		{
			name: pool.name,
			vendor: pool.vendor,
			description: pool.description ?? undefined,
			total_capacity: pool.total_capacity,
			cost_per_license: pool.cost_per_license ?? undefined,
			currency: pool.currency,
			billing_period: pool.billing_period,
			license_type: pool.license_type,
			expiration_date: expirationDate,
			expiration_policy: pool.expiration_policy,
			warning_days: pool.warning_days
		},
		zod(updatePoolSchema)
	);

	return { pool, form };
};

export const actions: Actions = {
	update: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(updatePoolSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		// Handle expiration_date: append time if only date provided
		let expirationDate = form.data.expiration_date || undefined;
		if (expirationDate && !expirationDate.includes('T')) {
			expirationDate = `${expirationDate}T00:00:00Z`;
		}

		const body: UpdateLicensePoolRequest = {
			name: form.data.name || undefined,
			vendor: form.data.vendor || undefined,
			description: form.data.description || undefined,
			total_capacity: form.data.total_capacity ?? undefined,
			cost_per_license: form.data.cost_per_license ?? undefined,
			currency: form.data.currency || undefined,
			billing_period: form.data.billing_period || undefined,
			expiration_date: expirationDate,
			expiration_policy: form.data.expiration_policy || undefined,
			warning_days: form.data.warning_days ?? undefined
		};

		try {
			await updateLicensePool(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		return message(form, 'License pool updated successfully');
	},

	archive: async ({ params, locals, fetch }) => {
		try {
			await archiveLicensePool(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		return { success: true, action: 'archived' };
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteLicensePool(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		redirect(302, '/governance/licenses');
	}
};
