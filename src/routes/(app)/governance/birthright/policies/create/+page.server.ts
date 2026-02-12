import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { birthrightPolicyFormSchema, createBirthrightPolicySchema } from '$lib/schemas/birthright';
import { createBirthrightPolicy } from '$lib/api/birthright';
import { listEntitlements } from '$lib/api/governance';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { CreateBirthrightPolicyRequest } from '$lib/api/types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(birthrightPolicyFormSchema));

	let entitlements: { id: string; name: string }[] = [];
	try {
		const result = await listEntitlements(
			{ status: 'active', limit: 100 },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		entitlements = result.items.map((e) => ({ id: e.id, name: e.name }));
	} catch {
		// If entitlements fail to load, the form will show a warning
	}

	return { form, entitlements };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const formData = await request.formData();

		// Extract conditions and entitlement_ids from hidden JSON fields
		const conditionsJson = formData.get('conditions_json') as string;
		const entitlementIdsJson = formData.get('entitlement_ids_json') as string;

		let conditions: unknown[] = [];
		let entitlement_ids: string[] = [];
		try {
			conditions = JSON.parse(conditionsJson || '[]');
			entitlement_ids = JSON.parse(entitlementIdsJson || '[]');
		} catch {
			// will fail validation below
		}

		// Build raw data for superValidate
		const rawData = {
			name: formData.get('name') as string,
			description: (formData.get('description') as string) || undefined,
			priority: formData.get('priority') as string,
			evaluation_mode: formData.get('evaluation_mode') as string,
			grace_period_days: formData.get('grace_period_days') as string,
			conditions,
			entitlement_ids
		};

		const form = await superValidate(rawData as Record<string, unknown>, zod(createBirthrightPolicySchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const body: CreateBirthrightPolicyRequest = {
			name: form.data.name,
			description: form.data.description || undefined,
			priority: form.data.priority,
			conditions: form.data.conditions,
			entitlement_ids: form.data.entitlement_ids,
			evaluation_mode: form.data.evaluation_mode,
			grace_period_days: form.data.grace_period_days
		};

		try {
			const created = await createBirthrightPolicy(
				body,
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
			redirect(302, `/governance/birthright/policies/${created.id}`);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}
	}
};
