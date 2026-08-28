import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listDuplicates, detectDuplicates } from '$lib/api/dedup';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const status = url.searchParams.get('status') ?? undefined;
	const min_confidence = url.searchParams.get('min_confidence')
		? Number(url.searchParams.get('min_confidence'))
		: undefined;
	const max_confidence = url.searchParams.get('max_confidence')
		? Number(url.searchParams.get('max_confidence'))
		: undefined;
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
		if (typeof body.min_confidence !== 'number') {
			error(400, 'min_confidence must be a number');
		}
		minConfidence = body.min_confidence;
	}
	const result = await detectDuplicates(
		minConfidence,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
