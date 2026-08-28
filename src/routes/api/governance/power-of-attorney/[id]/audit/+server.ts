import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPoaAudit } from '$lib/api/power-of-attorney';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const event_type = url.searchParams.get('event_type') ?? undefined;
	const from = url.searchParams.get('from') ?? undefined;
	const to = url.searchParams.get('to') ?? undefined;

	const result = await getPoaAudit(
		params.id,
		{ event_type, from, to, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
