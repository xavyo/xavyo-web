import type { PageServerLoad, Actions } from './$types';
import { createBirthrightPolicy } from '$lib/api/birthright';
import { listEntitlements } from '$lib/api/governance';
import { error, redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { createBirthrightPolicySchema } from '$lib/schemas/birthright';
import {
	isJsonParseError,
	parseJsonArray,
	parseOptionalBoundedInteger
} from '$lib/utils/json-record';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const entRes = await listEntitlements({ limit: 100, offset: 0 }, locals.accessToken, locals.tenantId, fetch);
	const form = await superValidate(zod(createBirthrightPolicySchema));
	return { form, entitlements: entRes.items };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
		const formData = await request.formData();
		const conditionsRaw = formData.get('conditions_json') as string;
		const entitlementIds = formData.getAll('entitlement_ids') as string[];
		let conditions: unknown[] = [];
		if (conditionsRaw) {
			try {
				conditions = parseJsonArray(conditionsRaw);
			} catch (e) {
				if (isHttpError(e)) throw e;
				error(400, 'Conditions must be a JSON array');
			}
		}
		let priority: number;
		let grace_period_days: number | undefined;
		try {
			priority = parseOptionalBoundedInteger(formData.get('priority'), 0, 1000, 'priority') ?? 0;
			grace_period_days = parseOptionalBoundedInteger(
				formData.get('grace_period_days'),
				0,
				365,
				'grace_period_days'
			);
		} catch (e) {
			if (isJsonParseError(e)) {
				error(400, e instanceof Error ? e.message : 'Invalid numeric fields');
			}
			throw e;
		}
		const body = {
			name: formData.get('name') as string,
			description: (formData.get('description') as string) || undefined,
			priority,
			conditions,
			entitlement_ids: entitlementIds,
			evaluation_mode: (formData.get('evaluation_mode') as string) || 'all_match',
			grace_period_days
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
