import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listIdentityCorrelationRules, createIdentityCorrelationRule } from '$lib/api/correlation';
import type {
	CorrelationAlgorithm,
	CorrelationMatchType,
	CreateIdentityCorrelationRuleRequest
} from '$lib/api/types';
import { listPagination } from '$lib/server/list-pagination';
import { JsonObjectError, parseBoundedInteger, requireFiniteNumber } from '$lib/utils/json-record';

const MATCH_TYPES = ['exact', 'fuzzy', 'expression'] as const;
const ALGORITHMS = ['levenshtein', 'jaro_winkler'] as const;

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const match_type = url.searchParams.get('match_type') ?? undefined;
	const is_active = url.searchParams.has('is_active') ? url.searchParams.get('is_active') === 'true' : undefined;
	const attribute = url.searchParams.get('attribute') ?? undefined;

	const result = await listIdentityCorrelationRules(
		{ match_type, is_active, attribute, ...listPagination(url) },
		locals.accessToken, locals.tenantId, fetch
	);
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
	if (typeof body.name !== 'string' || body.name.length === 0) {
		error(400, 'name is required');
	}
	if (typeof body.attribute !== 'string' || body.attribute.length === 0) {
		error(400, 'attribute is required');
	}
	if (!MATCH_TYPES.includes(body.match_type as (typeof MATCH_TYPES)[number])) {
		error(400, 'match_type is required');
	}
	let threshold: number;
	let weight: number;
	let priority: number;
	try {
		threshold = requireFiniteNumber(body.threshold, 'threshold');
		weight = requireFiniteNumber(body.weight, 'weight');
		priority = parseBoundedInteger(body.priority, 0, 1_000_000, 'priority');
	} catch (e) {
		if (e instanceof JsonObjectError) error(400, e.message);
		throw e;
	}
	const data: CreateIdentityCorrelationRuleRequest = {
		name: body.name,
		attribute: body.attribute,
		match_type: body.match_type as CorrelationMatchType,
		threshold,
		weight,
		priority
	};
	if (body.algorithm !== undefined) {
		if (!ALGORITHMS.includes(body.algorithm as (typeof ALGORITHMS)[number])) {
			error(400, 'algorithm is required');
		}
		data.algorithm = body.algorithm as CorrelationAlgorithm;
	}
	const result = await createIdentityCorrelationRule(data, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
