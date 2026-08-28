import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRiskScores } from '$lib/api/risk';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const risk_level = url.searchParams.get('risk_level') ?? undefined;
	const min_score = url.searchParams.get('min_score') ? Number(url.searchParams.get('min_score')) : undefined;
	const max_score = url.searchParams.get('max_score') ? Number(url.searchParams.get('max_score')) : undefined;
	const sort_by = url.searchParams.get('sort_by') ?? undefined;

	try {
		const result = await listRiskScores(
			{ risk_level, min_score, max_score, sort_by, ...listPagination(url) },
			locals.accessToken, locals.tenantId, fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Internal error');
	}
};
