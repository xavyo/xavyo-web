import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { createEntitlementLinkSchema } from '$lib/schemas/licenses';
import { listLicensePools, createLicenseEntitlementLink } from '$lib/api/licenses';
import { listEntitlements } from '$lib/api/governance';
import { ApiError } from '$lib/api/client';
import type { CreateLicenseEntitlementLinkRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const [form, poolsResponse, entitlementsResponse] = await Promise.all([
		superValidate(zod(createEntitlementLinkSchema)),
		listLicensePools({ limit: 100 }, locals.accessToken!, locals.tenantId!, fetch),
		listEntitlements({}, locals.accessToken!, locals.tenantId!, fetch)
	]);

	return { form, pools: poolsResponse.items, entitlements: entitlementsResponse.items };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createEntitlementLinkSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const body: CreateLicenseEntitlementLinkRequest = {
			license_pool_id: form.data.license_pool_id,
			entitlement_id: form.data.entitlement_id,
			priority: form.data.priority ?? 0
		};

		try {
			await createLicenseEntitlementLink(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/governance/licenses?tab=entitlement-links');
	}
};
