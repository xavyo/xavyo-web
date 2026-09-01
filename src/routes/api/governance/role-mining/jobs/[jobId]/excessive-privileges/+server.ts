import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listExcessivePrivileges } from '$lib/api/role-mining';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const status = url.searchParams.get('status') || undefined;
	const user_id = url.searchParams.get('user_id') || undefined;

	const result = await listExcessivePrivileges(
		params.jobId,
		{ status, user_id, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
