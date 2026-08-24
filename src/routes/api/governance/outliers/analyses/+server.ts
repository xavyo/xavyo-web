import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listOutlierAnalyses, triggerOutlierAnalysis } from '$lib/api/outliers';
import type { OutlierTriggerType, TriggerAnalysisRequest } from '$lib/api/types';

const TRIGGER_TYPES = ['scheduled', 'manual', 'api'] as const;

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
	if (!TRIGGER_TYPES.includes(body.triggered_by as (typeof TRIGGER_TYPES)[number])) {
		error(400, 'triggered_by is required');
	}
	const data: TriggerAnalysisRequest = {
		triggered_by: body.triggered_by as OutlierTriggerType
	};
	const result = await triggerOutlierAnalysis(data, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
