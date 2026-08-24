import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { previewBatchMerge } from '$lib/api/dedup';
import type {
	AttributeResolutionRule,
	BatchMergePreviewRequest,
	EntitlementStrategy
} from '$lib/api/types';

const STRATEGIES = ['union', 'intersection', 'manual'] as const;
const ATTR_RULES = ['newest_wins', 'oldest_wins', 'prefer_non_null'] as const;

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
	if (
		!Array.isArray(body.candidate_ids) ||
		body.candidate_ids.length === 0 ||
		body.candidate_ids.some((id) => typeof id !== 'string' || id.length === 0)
	) {
		error(400, 'candidate_ids is required');
	}
	if (!STRATEGIES.includes(body.entitlement_strategy as (typeof STRATEGIES)[number])) {
		error(400, 'entitlement_strategy is required');
	}
	if (!ATTR_RULES.includes(body.attribute_rule as (typeof ATTR_RULES)[number])) {
		error(400, 'attribute_rule is required');
	}
	const data: BatchMergePreviewRequest = {
		candidate_ids: body.candidate_ids as string[],
		entitlement_strategy: body.entitlement_strategy as EntitlementStrategy,
		attribute_rule: body.attribute_rule as AttributeResolutionRule
	};
	if (body.min_confidence !== undefined) {
		if (body.min_confidence !== null && typeof body.min_confidence !== 'number') {
			error(400, 'min_confidence must be a number or null');
		}
		data.min_confidence = body.min_confidence as number | null;
	}
	if (body.limit !== undefined) {
		if (typeof body.limit !== 'number') {
			error(400, 'limit must be a number');
		}
		data.limit = body.limit;
	}
	if (body.offset !== undefined) {
		if (typeof body.offset !== 'number') {
			error(400, 'offset must be a number');
		}
		data.offset = body.offset;
	}
	const result = await previewBatchMerge(data, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
