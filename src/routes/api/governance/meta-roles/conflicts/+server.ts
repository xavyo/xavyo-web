import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listConflicts } from '$lib/api/meta-roles';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const affected_role_id = url.searchParams.get('affected_role_id') ?? undefined;
	const meta_role_id = url.searchParams.get('meta_role_id') ?? undefined;
	const conflict_type = url.searchParams.get('conflict_type') ?? undefined;
	const resolution_status = url.searchParams.get('resolution_status') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listConflicts(
		{ affected_role_id, meta_role_id, conflict_type, resolution_status, limit, offset },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
