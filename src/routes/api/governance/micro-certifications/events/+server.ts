import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchCertificationEvents } from '$lib/api/micro-certifications';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const event_type = url.searchParams.get('event_type') ?? undefined;
	const actor_id = url.searchParams.get('actor_id') ?? undefined;
	const micro_certification_id =
		url.searchParams.get('micro_certification_id') ??
		url.searchParams.get('certification_id') ??
		undefined;
	const from_date = url.searchParams.get('from_date') ?? undefined;
	const to_date = url.searchParams.get('to_date') ?? undefined;

	const result = await searchCertificationEvents(
		{ event_type, actor_id, micro_certification_id, from_date, to_date, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
