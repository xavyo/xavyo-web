import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listOutlierResults } from '$lib/api/outliers';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const analysis_id = url.searchParams.get('analysis_id') ?? undefined;
	const user_id = url.searchParams.get('user_id') ?? undefined;
	const classification = url.searchParams.get('classification') ?? undefined;
	const min_score = url.searchParams.get('min_score') ? Number(url.searchParams.get('min_score')) : undefined;
	const max_score = url.searchParams.get('max_score') ? Number(url.searchParams.get('max_score')) : undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');
	const result = await listOutlierResults({ analysis_id, user_id, classification, min_score, max_score, limit, offset }, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
