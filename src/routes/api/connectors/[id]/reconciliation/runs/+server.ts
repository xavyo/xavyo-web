import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRuns, triggerRun } from '$lib/api/reconciliation';

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

	const body = await request.json();
	const result = await triggerRun(params.id, body, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 202 });
};
