import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { bulkReclaimLicenses } from '$lib/api/licenses';
import type { BulkReclaimLicenseRequest } from '$lib/api/types';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
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
		if (
			!Array.isArray(body.assignment_ids) ||
			body.assignment_ids.length === 0 ||
			body.assignment_ids.some((id) => typeof id !== 'string' || id.length === 0)
		) {
			return json({ error: 'assignment_ids is required' }, { status: 400 });
		}
		if (typeof body.reason !== 'string' || body.reason.length === 0) {
			return json({ error: 'reason is required' }, { status: 400 });
		}
		const data: BulkReclaimLicenseRequest = {
			license_pool_id: body.license_pool_id,
			assignment_ids: body.assignment_ids as string[],
			reason: body.reason
		};
		const result = await bulkReclaimLicenses(data, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to bulk reclaim licenses' }, { status: 500 });
	}
};
