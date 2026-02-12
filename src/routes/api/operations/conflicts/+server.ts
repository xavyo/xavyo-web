import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listConflicts } from '$lib/api/operations';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const operation_id = url.searchParams.get('operation_id') ?? undefined;
	const conflict_type = url.searchParams.get('conflict_type') ?? undefined;
	const pending_only_param = url.searchParams.get('pending_only');
	const pending_only = pending_only_param !== null ? pending_only_param === 'true' : undefined;
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listConflicts(
		{ operation_id, conflict_type, pending_only, limit, offset },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
