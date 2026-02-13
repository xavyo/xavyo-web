import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listScriptExecutionLogs } from '$lib/api/script-analytics';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const script_id = url.searchParams.get('script_id') ?? undefined;
	const connector_id = url.searchParams.get('connector_id') ?? undefined;
	const binding_id = url.searchParams.get('binding_id') ?? undefined;
	const status = url.searchParams.get('status') ?? undefined;
	const dry_run_str = url.searchParams.get('dry_run');
	const dry_run = dry_run_str !== null ? dry_run_str === 'true' : undefined;
	const from_date = url.searchParams.get('from_date') ?? undefined;
	const to_date = url.searchParams.get('to_date') ?? undefined;
	const page = url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : undefined;
	const page_size = url.searchParams.get('page_size')
		? parseInt(url.searchParams.get('page_size')!)
		: undefined;

	const result = await listScriptExecutionLogs(
		{ script_id, connector_id, binding_id, status, dry_run, from_date, to_date, page, page_size },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
