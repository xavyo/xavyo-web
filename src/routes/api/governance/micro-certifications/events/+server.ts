import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchCertificationEvents } from '$lib/api/micro-certifications';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Admin access required');

	const event_type = url.searchParams.get('event_type') ?? undefined;
	const actor_id = url.searchParams.get('actor_id') ?? undefined;
	const certification_id = url.searchParams.get('certification_id') ?? undefined;
	const from_date = url.searchParams.get('from_date') ?? undefined;
	const to_date = url.searchParams.get('to_date') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await searchCertificationEvents(
		{ event_type, actor_id, certification_id, from_date, to_date, limit, offset },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
