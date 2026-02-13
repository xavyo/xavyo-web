import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listDispositions } from '$lib/api/outliers';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const user_id = url.searchParams.get('user_id') ?? undefined;
	const status = url.searchParams.get('status') ?? undefined;
	const reviewed_by = url.searchParams.get('reviewed_by') ?? undefined;
	const include_expired = url.searchParams.get('include_expired') === 'true' ? true : undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');
	const result = await listDispositions({ user_id, status, reviewed_by, include_expired, limit, offset }, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
