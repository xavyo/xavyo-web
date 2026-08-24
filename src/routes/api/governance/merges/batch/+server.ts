import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { executeBatchMerge } from '$lib/api/dedup';

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
	if (!Array.isArray(body.candidate_ids) || body.candidate_ids.length === 0) {
		error(400, 'candidate_ids is required');
	}
	if (
		body.entitlement_strategy !== 'union' &&
		body.entitlement_strategy !== 'intersection' &&
		body.entitlement_strategy !== 'manual'
	) {
		error(400, 'entitlement_strategy is required');
	}
	if (
		body.attribute_rule !== 'newest_wins' &&
		body.attribute_rule !== 'oldest_wins' &&
		body.attribute_rule !== 'prefer_non_null'
	) {
		error(400, 'attribute_rule is required');
	}
	const result = await executeBatchMerge(
		{
			candidate_ids: body.candidate_ids as string[],
			entitlement_strategy: body.entitlement_strategy,
			attribute_rule: body.attribute_rule,
			min_confidence: typeof body.min_confidence === 'number' ? body.min_confidence : undefined,
			skip_sod_violations: body.skip_sod_violations === true
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
