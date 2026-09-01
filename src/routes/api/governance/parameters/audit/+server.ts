import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listParameterAudit } from '$lib/api/governance-roles';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const assignment_id = url.searchParams.get('assignment_id') ?? undefined;
	const event_type = url.searchParams.get('event_type') ?? undefined;
	const actor_id = url.searchParams.get('actor_id') ?? undefined;
	const from_date = url.searchParams.get('from_date') ?? undefined;
	const to_date = url.searchParams.get('to_date') ?? undefined;

	const result = await listParameterAudit(
		{ assignment_id, event_type, actor_id, from_date, to_date, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
