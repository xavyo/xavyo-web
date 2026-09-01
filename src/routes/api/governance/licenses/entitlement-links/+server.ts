import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listLicenseEntitlementLinks, createLicenseEntitlementLink } from '$lib/api/licenses';
import type { CreateLicenseEntitlementLinkRequest } from '$lib/api/types';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const params: Record<string, string | number | boolean> = {};
		const license_pool_id = url.searchParams.get('license_pool_id');
		const entitlement_id = url.searchParams.get('entitlement_id');
		const enabled = url.searchParams.get('enabled');
		const { limit, offset } = listPagination(url);

		if (license_pool_id) params.license_pool_id = license_pool_id;
		if (entitlement_id) params.entitlement_id = entitlement_id;
		if (enabled) params.enabled = enabled === 'true';
		if (limit != null) params.limit = limit;
		if (offset != null) params.offset = offset;

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

	try {
		let parsed: unknown;
		try {
			parsed = await request.json();
		} catch {
			return json({ error: 'Invalid JSON body' }, { status: 400 });
		}
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			return json({ error: 'Invalid JSON body' }, { status: 400 });
		}
		const body = parsed as Record<string, unknown>;
		if (typeof body.license_pool_id !== 'string' || body.license_pool_id.length === 0) {
			return json({ error: 'license_pool_id is required' }, { status: 400 });
		}
		if (typeof body.entitlement_id !== 'string' || body.entitlement_id.length === 0) {
			return json({ error: 'entitlement_id is required' }, { status: 400 });
		}
		const data: CreateLicenseEntitlementLinkRequest = {
			license_pool_id: body.license_pool_id,
			entitlement_id: body.entitlement_id
		};
		if (body.priority !== undefined) {
			try {
				data.priority = parseBoundedInteger(body.priority, 0, 1_000_000, 'priority');
			} catch (e) {
				if (e instanceof JsonObjectError) {
					return json({ error: e.message }, { status: 400 });
				}
				throw e;
			}
		}
		const result = await createLicenseEntitlementLink(
			data,
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
