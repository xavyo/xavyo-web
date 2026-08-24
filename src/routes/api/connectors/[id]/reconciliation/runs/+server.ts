import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRuns, triggerRun } from '$lib/api/reconciliation';
import type { ReconciliationMode, TriggerRunRequest } from '$lib/api/types';

const MODES = ['full', 'delta'] as const;

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const mode = url.searchParams.get('mode') ?? undefined;
	const status = url.searchParams.get('status') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listRuns(
		params.id,
		{ mode, status, limit, offset },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	let parsed: unknown;
	try {
		parsed = await request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		error(400, 'Invalid JSON body');
	}
	const body = parsed as Record<string, unknown>;
	if (!MODES.includes(body.mode as (typeof MODES)[number])) {
		error(400, 'mode is required');
	}
	if (typeof body.dry_run !== 'boolean') {
		error(400, 'dry_run is required');
	}
	const data: TriggerRunRequest = {
		mode: body.mode as ReconciliationMode,
		dry_run: body.dry_run
	};
	const result = await triggerRun(params.id, data, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 202 });
};
