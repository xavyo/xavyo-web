import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listScriptAuditEvents } from '$lib/api/script-analytics';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const script_id = url.searchParams.get('script_id') ?? undefined;
	const action = url.searchParams.get('action') ?? undefined;

	const result = await listScriptAuditEvents(
		{ script_id, action, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
