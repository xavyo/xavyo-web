import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listLicenseIncompatibilities, createLicenseIncompatibility } from '$lib/api/licenses';
import type { CreateLicenseIncompatibilityRequest } from '$lib/api/types';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const params: Record<string, string | number> = {};
		const pool_id = url.searchParams.get('pool_id');
		const { limit, offset } = listPagination(url);

		if (pool_id) params.pool_id = pool_id;
		if (limit != null) params.limit = limit;
		if (offset != null) params.offset = offset;

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
		if (typeof body.pool_a_id !== 'string' || body.pool_a_id.length === 0) {
			return json({ error: 'pool_a_id is required' }, { status: 400 });
		}
		if (typeof body.pool_b_id !== 'string' || body.pool_b_id.length === 0) {
			return json({ error: 'pool_b_id is required' }, { status: 400 });
		}
		if (typeof body.reason !== 'string' || body.reason.length === 0) {
			return json({ error: 'reason is required' }, { status: 400 });
		}
		const data: CreateLicenseIncompatibilityRequest = {
			pool_a_id: body.pool_a_id,
			pool_b_id: body.pool_b_id,
			reason: body.reason
		};
		const result = await createLicenseIncompatibility(
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
		return json({ error: 'Failed to create license incompatibility' }, { status: 500 });
	}
};
