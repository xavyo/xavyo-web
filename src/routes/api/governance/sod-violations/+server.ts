import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listSodViolations } from '$lib/api/governance';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await listSodViolations(
		{
			rule_id: url.searchParams.get('rule_id') ?? undefined,
			user_id: url.searchParams.get('user_id') ?? undefined,
			status: url.searchParams.get('status') ?? undefined,
			detected_after: url.searchParams.get('detected_after') ?? undefined,
			detected_before: url.searchParams.get('detected_before') ?? undefined,
			...listPagination(url)
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
