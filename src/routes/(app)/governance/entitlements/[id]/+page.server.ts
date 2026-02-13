import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { updateEntitlementSchema } from '$lib/schemas/governance';
import {
	getEntitlement,
	updateEntitlement,
	deleteEntitlement,
	setEntitlementOwner,
	removeEntitlementOwner
} from '$lib/api/governance';
import { ApiError } from '$lib/api/client';
import type { UpdateEntitlementRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	let entitlement;
	try {
		entitlement = await getEntitlement(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load entitlement');
	}

	const form = await superValidate(
		{
			name: entitlement.name,
			description: entitlement.description ?? undefined,
			risk_level: entitlement.risk_level,
			data_protection_classification: entitlement.data_protection_classification,
			legal_basis: entitlement.legal_basis ?? undefined,
			is_delegable: entitlement.is_delegable,
			retention_period_days: entitlement.retention_period_days ?? undefined,
			data_controller: entitlement.data_controller ?? undefined,
			data_processor: entitlement.data_processor ?? undefined,
			purposes: entitlement.purposes?.join(', ') ?? undefined
		},
		zod(updateEntitlementSchema)
	);

	return { entitlement, form };
};

export const actions: Actions = {
	update: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(updateEntitlementSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		// Build request body - purposes is comma-separated in form, array in API
		const purposes = form.data.purposes
			? form.data.purposes
					.split(',')
					.map((s: string) => s.trim())
					.filter(Boolean)
			: undefined;

		const body: UpdateEntitlementRequest = {
			name: form.data.name || undefined,
			description: form.data.description || undefined,
			risk_level: form.data.risk_level || undefined,
			data_protection_classification: form.data.data_protection_classification || undefined,
			legal_basis: form.data.legal_basis || undefined,
			is_delegable: form.data.is_delegable,
			retention_period_days: form.data.retention_period_days || undefined,
			data_controller: form.data.data_controller || undefined,
			data_processor: form.data.data_processor || undefined,
			purposes
		};

		try {
			await updateEntitlement(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		return message(form, 'Entitlement updated successfully');
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteEntitlement(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		redirect(302, '/governance');
	},

	setOwner: async ({ request, params, locals, fetch }) => {
		const formData = await request.formData();
		const ownerId = formData.get('owner_id')?.toString();

		if (!ownerId) {
			return fail(400, { error: 'Owner ID is required' });
		}

		try {
			await setEntitlementOwner(params.id, ownerId, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		return { success: true, action: 'ownerSet' };
	},

	removeOwner: async ({ params, locals, fetch }) => {
		try {
			await removeEntitlementOwner(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		return { success: true, action: 'ownerRemoved' };
	}
};
