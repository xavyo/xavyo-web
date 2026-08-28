import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listDispositions } from '$lib/api/outliers';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const user_id = url.searchParams.get('user_id') ?? undefined;
	const status = url.searchParams.get('status') ?? undefined;
	const reviewed_by = url.searchParams.get('reviewed_by') ?? undefined;
	const include_expired = url.searchParams.get('include_expired') === 'true' ? true : undefined;
	const result = await listDispositions(
		{ user_id, status, reviewed_by, include_expired, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
