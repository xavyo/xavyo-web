import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getOperationsDlq } from '$lib/api/operations';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const connector_id = url.searchParams.get('connector_id') ?? undefined;

	const result = await getOperationsDlq(
		{ connector_id, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
