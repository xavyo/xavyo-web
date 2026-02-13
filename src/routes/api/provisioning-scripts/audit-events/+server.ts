import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listScriptAuditEvents } from '$lib/api/script-analytics';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const script_id = url.searchParams.get('script_id') ?? undefined;
	const action = url.searchParams.get('action') ?? undefined;
	const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;
	const offset = url.searchParams.get('offset')
		? parseInt(url.searchParams.get('offset')!)
		: undefined;

	const result = await listScriptAuditEvents(
		{ script_id, action, limit, offset },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
