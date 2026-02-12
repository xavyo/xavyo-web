import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listLicenseAssignments, createLicenseAssignment } from '$lib/api/licenses';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	const license_pool_id = url.searchParams.get('license_pool_id');
	const user_id = url.searchParams.get('user_id');
	const status = url.searchParams.get('status');
	const source = url.searchParams.get('source');
	const limit = url.searchParams.get('limit');
	const offset = url.searchParams.get('offset');

	try {
		const result = await listLicenseAssignments(
			{
				license_pool_id: license_pool_id ?? undefined,
				user_id: user_id ?? undefined,
				status: status ?? undefined,
				source: source ?? undefined,
				limit: limit ? parseInt(limit, 10) : undefined,
				offset: offset ? parseInt(offset, 10) : undefined
			},
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to list license assignments' }, { status: 500 });
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
		const result = await createLicenseAssignment(body, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to create license assignment' }, { status: 500 });
	}
};
