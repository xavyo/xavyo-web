import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { listLicenseIncompatibilities, createLicenseIncompatibility } from '$lib/api/licenses';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	try {
		const params: Record<string, string | number> = {};
		const pool_id = url.searchParams.get('pool_id');
		const limit = url.searchParams.get('limit');
		const offset = url.searchParams.get('offset');

		if (pool_id) params.pool_id = pool_id;
		if (limit) params.limit = Number(limit);
		if (offset) params.offset = Number(offset);

		const result = await listLicenseIncompatibilities(
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
		return json({ error: 'Failed to list license incompatibilities' }, { status: 500 });
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
		const result = await createLicenseIncompatibility(
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
		return json({ error: 'Failed to create license incompatibility' }, { status: 500 });
	}
};
