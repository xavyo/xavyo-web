import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listCorrelationRules, createCorrelationRule } from '$lib/api/correlation';
import { finiteNumber, listPagination } from '$lib/server/list-pagination';
import { JsonObjectError, parseBoundedInteger, requireFiniteNumber } from '$lib/utils/json-record';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const match_type = url.searchParams.get('match_type') ?? undefined;
	const is_active = url.searchParams.has('is_active') ? url.searchParams.get('is_active') === 'true' : undefined;
	const tier = finiteNumber(url.searchParams.get('tier'));

	const result = await listCorrelationRules(
		params.connectorId, { match_type, is_active, tier, ...listPagination(url) },
		locals.accessToken, locals.tenantId, fetch
	);
	return json(result);
};

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	if (typeof body.source_attribute !== 'string' || body.source_attribute.length === 0) {
		error(400, 'source_attribute is required');
	}
	if (typeof body.target_attribute !== 'string' || body.target_attribute.length === 0) {
		error(400, 'target_attribute is required');
	}
	if (body.match_type !== 'exact' && body.match_type !== 'fuzzy' && body.match_type !== 'expression') {
		error(400, 'match_type is required');
	}
	let threshold: number;
	let weight: number;
	let tier: number;
	let priority: number;
	try {
		threshold = requireFiniteNumber(body.threshold, 'threshold');
		weight = requireFiniteNumber(body.weight, 'weight');
		tier = parseBoundedInteger(body.tier, 0, 1_000_000, 'tier');
		priority = parseBoundedInteger(body.priority, 0, 1_000_000, 'priority');
	} catch (e) {
		if (e instanceof JsonObjectError) error(400, e.message);
		throw e;
	}
	if (typeof body.is_definitive !== 'boolean' || typeof body.normalize !== 'boolean') {
		error(400, 'is_definitive and normalize are required');
	}
	const result = await createCorrelationRule(
		params.connectorId,
		{
			name: body.name,
			source_attribute: body.source_attribute,
			target_attribute: body.target_attribute,
			match_type: body.match_type,
			threshold,
			weight,
			tier,
			is_definitive: body.is_definitive,
			normalize: body.normalize,
			priority
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result, { status: 201 });
};
