import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getEventStats } from '$lib/api/meta-roles';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const meta_role_id = url.searchParams.get('meta_role_id') ?? undefined;
	if (!meta_role_id) {
		error(400, 'meta_role_id is required');
	}

	const event_type = url.searchParams.get('event_type') ?? undefined;
	const actor_id = url.searchParams.get('actor_id') ?? undefined;
	const from_date = url.searchParams.get('from_date') ?? undefined;
	const to_date = url.searchParams.get('to_date') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await getEventStats(
		{ meta_role_id, event_type, actor_id, from_date, to_date, limit, offset },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
