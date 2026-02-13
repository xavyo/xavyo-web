import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { listLicenseEntitlementLinks, createLicenseEntitlementLink } from '$lib/api/licenses';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	try {
		const params: Record<string, string | number | boolean> = {};
		const license_pool_id = url.searchParams.get('license_pool_id');
		const entitlement_id = url.searchParams.get('entitlement_id');
		const enabled = url.searchParams.get('enabled');
		const limit = url.searchParams.get('limit');
		const offset = url.searchParams.get('offset');

		if (license_pool_id) params.license_pool_id = license_pool_id;
		if (entitlement_id) params.entitlement_id = entitlement_id;
		if (enabled) params.enabled = enabled === 'true';
		if (limit) params.limit = Number(limit);
		if (offset) params.offset = Number(offset);

		const result = await listLicenseEntitlementLinks(
			params,
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to list license entitlement links' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	try {
		const body = await request.json();
		const result = await createLicenseEntitlementLink(
			body,
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to create license entitlement link' }, { status: 500 });
	}
};
