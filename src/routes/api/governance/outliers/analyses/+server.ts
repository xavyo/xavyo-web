import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listOutlierAnalyses, triggerOutlierAnalysis } from '$lib/api/outliers';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const status = url.searchParams.get('status') ?? undefined;
	const triggered_by = url.searchParams.get('triggered_by') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');
	const result = await listOutlierAnalyses({ status, triggered_by, limit, offset }, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const body = await request.json();
	const result = await triggerOutlierAnalysis(body, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
