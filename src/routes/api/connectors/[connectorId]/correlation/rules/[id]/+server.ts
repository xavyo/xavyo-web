import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCorrelationRule, updateCorrelationRule, deleteCorrelationRule } from '$lib/api/correlation';
import type { UpdateCorrelationRuleRequest } from '$lib/api/types';
import { JsonObjectError, parseBoundedInteger, requireFiniteNumber } from '$lib/utils/json-record';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await getCorrelationRule(params.connectorId, params.id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const PATCH: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	const data: UpdateCorrelationRuleRequest = {};
	if (body.name !== undefined) {
		if (typeof body.name !== 'string' || body.name.length === 0) {
			error(400, 'name must be a non-empty string');
		}
		data.name = body.name;
	}
	if (body.source_attribute !== undefined) {
		if (typeof body.source_attribute !== 'string' || body.source_attribute.length === 0) {
			error(400, 'source_attribute must be a non-empty string');
		}
		data.source_attribute = body.source_attribute;
	}
	if (body.target_attribute !== undefined) {
		if (typeof body.target_attribute !== 'string' || body.target_attribute.length === 0) {
			error(400, 'target_attribute must be a non-empty string');
		}
		data.target_attribute = body.target_attribute;
	}
	if (body.match_type !== undefined) {
		if (body.match_type !== 'exact' && body.match_type !== 'fuzzy' && body.match_type !== 'expression') {
			error(400, 'match_type must be exact, fuzzy, or expression');
		}
		data.match_type = body.match_type;
	}
	if (body.algorithm !== undefined) {
		if (body.algorithm !== null && body.algorithm !== 'levenshtein' && body.algorithm !== 'jaro_winkler') {
			error(400, 'algorithm must be levenshtein, jaro_winkler, or null');
		}
		data.algorithm = body.algorithm;
	}
	try {
		if (body.threshold !== undefined) {
			data.threshold = requireFiniteNumber(body.threshold, 'threshold');
		}
		if (body.weight !== undefined) {
			data.weight = requireFiniteNumber(body.weight, 'weight');
		}
		if (body.tier !== undefined) {
			data.tier = parseBoundedInteger(body.tier, 0, 1_000_000, 'tier');
		}
		if (body.priority !== undefined) {
			data.priority = parseBoundedInteger(body.priority, 0, 1_000_000, 'priority');
		}
	} catch (e) {
		if (e instanceof JsonObjectError) error(400, e.message);
		throw e;
	}
	if (body.expression !== undefined) {
		if (body.expression !== null && typeof body.expression !== 'string') {
			error(400, 'expression must be a string or null');
		}
		data.expression = body.expression;
	}
	if (body.is_definitive !== undefined) {
		if (typeof body.is_definitive !== 'boolean') {
			error(400, 'is_definitive must be a boolean');
		}
		data.is_definitive = body.is_definitive;
	}
	if (body.normalize !== undefined) {
		if (typeof body.normalize !== 'boolean') {
			error(400, 'normalize must be a boolean');
		}
		data.normalize = body.normalize;
	}
	if (body.is_active !== undefined) {
		if (typeof body.is_active !== 'boolean') {
			error(400, 'is_active must be a boolean');
		}
		data.is_active = body.is_active;
	}
	const result = await updateCorrelationRule(
		params.connectorId,
		params.id,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	await deleteCorrelationRule(params.connectorId, params.id, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
