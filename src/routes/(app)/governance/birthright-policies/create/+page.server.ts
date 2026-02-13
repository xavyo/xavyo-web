import type { PageServerLoad, Actions } from './$types';
import { createBirthrightPolicy } from '$lib/api/birthright';
import { listEntitlements } from '$lib/api/governance';
import { hasAdminRole } from '$lib/server/auth';
import { error, redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { createBirthrightPolicySchema } from '$lib/schemas/birthright';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	const entRes = await listEntitlements({ limit: 100, offset: 0 }, locals.accessToken, locals.tenantId, fetch);
	const form = await superValidate(zod(createBirthrightPolicySchema));
	return { form, entitlements: entRes.items };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
		if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
		const formData = await request.formData();
		const conditionsRaw = formData.get('conditions_json') as string;
		const entitlementIds = formData.getAll('entitlement_ids') as string[];
		const body = {
			name: formData.get('name') as string,
			description: (formData.get('description') as string) || undefined,
			priority: Number(formData.get('priority') ?? '0'),
			conditions: conditionsRaw ? JSON.parse(conditionsRaw) : [],
			entitlement_ids: entitlementIds,
			evaluation_mode: (formData.get('evaluation_mode') as string) || 'all_match',
			grace_period_days: Number(formData.get('grace_period_days') ?? '0') || undefined
		};
		try {
			await createBirthrightPolicy(body as any, locals.accessToken, locals.tenantId, fetch);
			redirect(303, '/governance/birthright-policies');
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) error(e.status, e.body.message);
			throw e;
		}
	}
};
