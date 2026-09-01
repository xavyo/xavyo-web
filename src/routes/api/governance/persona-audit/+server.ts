import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listPersonaAudit } from '$lib/api/personas';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const persona_id = url.searchParams.get('persona_id') ?? undefined;
	const archetype_id = url.searchParams.get('archetype_id') ?? undefined;
	const actor_id = url.searchParams.get('actor_id') ?? undefined;
	const event_type = url.searchParams.get('event_type') ?? undefined;
	const from_date = url.searchParams.get('from_date') ?? undefined;
	const to_date = url.searchParams.get('to_date') ?? undefined;

	const result = await listPersonaAudit(
		{ persona_id, archetype_id, actor_id, event_type, from_date, to_date, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
