import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { previewBatchMerge } from '$lib/api/dedup';
import type {
	AttributeResolutionRule,
	BatchMergePreviewRequest,
	EntitlementStrategy
} from '$lib/api/types';
import {
	JsonObjectError,
	parseBoundedInteger,
	requireFiniteNumber
} from '$lib/utils/json-record';

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
	try {
		if (body.min_confidence !== undefined && body.min_confidence !== null) {
			data.min_confidence = requireFiniteNumber(body.min_confidence, 'min_confidence');
		} else if (body.min_confidence === null) {
			throw new JsonObjectError('min_confidence must be a finite number');
		}
		if (body.limit !== undefined) {
			data.limit = parseBoundedInteger(body.limit, 1, 1000, 'limit');
		}
		if (body.offset !== undefined) {
			data.offset = parseBoundedInteger(body.offset, 0, 1_000_000, 'offset');
		}
	} catch (e) {
		if (e instanceof JsonObjectError) error(400, e.message);
		throw e;
	}
	const result = await previewBatchMerge(data, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
