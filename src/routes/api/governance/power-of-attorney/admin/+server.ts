import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { adminListPoa } from '$lib/api/power-of-attorney';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	const donor_id = url.searchParams.get('donor_id') ?? undefined;
	const attorney_id = url.searchParams.get('attorney_id') ?? undefined;
	const status = url.searchParams.get('status') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await adminListPoa({ donor_id, attorney_id, status, limit, offset }, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
