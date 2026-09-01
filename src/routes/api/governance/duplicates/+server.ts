import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listDuplicates, detectDuplicates } from '$lib/api/dedup';
import { finiteNumber, listPagination } from '$lib/server/list-pagination';
import { JsonObjectError, requireFiniteNumber } from '$lib/utils/json-record';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const status = url.searchParams.get('status') ?? undefined;
	const min_confidence = finiteNumber(url.searchParams.get('min_confidence'));
	const max_confidence = finiteNumber(url.searchParams.get('max_confidence'));
	const identity_id = url.searchParams.get('identity_id') ?? undefined;

	const result = await listDuplicates(
		{
			status: status as 'pending' | 'merged' | 'dismissed' | undefined,
			min_confidence,
			max_confidence,
			identity_id,
			...listPagination(url)
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
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
	let minConfidence: number | undefined;
	if (body.min_confidence !== undefined) {
		try {
			minConfidence = requireFiniteNumber(body.min_confidence, 'min_confidence');
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
	}
	const result = await detectDuplicates(
		minConfidence,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
