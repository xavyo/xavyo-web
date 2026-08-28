import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listDlqEntries } from '$lib/api/webhooks';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await listDlqEntries(
		listPagination(url),
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
