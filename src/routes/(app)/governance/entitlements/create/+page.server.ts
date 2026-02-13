import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createEntitlementSchema } from '$lib/schemas/governance';
import { createEntitlement, listApplications } from '$lib/api/governance';
import { ApiError } from '$lib/api/client';
import type { CreateEntitlementRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(createEntitlementSchema));

	let applications: { id: string; name: string }[] = [];
	try {
		const result = await listApplications(
			{ status: 'active', limit: 100 },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		applications = result.items.map((a) => ({ id: a.id, name: a.name }));
	} catch {
		// If applications fail to load, the form will show a warning
	}

	return { form, applications };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createEntitlementSchema));

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

		const body: CreateEntitlementRequest = {
			application_id: form.data.application_id,
			name: form.data.name,
			description: form.data.description || undefined,
			risk_level: form.data.risk_level as any,
			data_protection_classification: form.data.data_protection_classification as any,
			legal_basis: form.data.legal_basis || undefined,
			is_delegable: form.data.is_delegable,
			retention_period_days: form.data.retention_period_days || undefined,
			data_controller: form.data.data_controller || undefined,
			data_processor: form.data.data_processor || undefined,
			purposes
		};

		try {
			await createEntitlement(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/governance');
	}
};
