import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { getIdentityCorrelationRule, updateIdentityCorrelationRule, deleteIdentityCorrelationRule } from '$lib/api/correlation';
import type {
	CorrelationAlgorithm,
	CorrelationMatchType,
	UpdateIdentityCorrelationRuleRequest
} from '$lib/api/types';

const MATCH_TYPES = ['exact', 'fuzzy', 'expression'] as const;
const ALGORITHMS = ['levenshtein', 'jaro_winkler'] as const;

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await getIdentityCorrelationRule(params.id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
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
	const data: UpdateIdentityCorrelationRuleRequest = {};
	if (body.name !== undefined) {
		if (typeof body.name !== 'string' || body.name.length === 0) {
			error(400, 'name must be a non-empty string');
		}
		data.name = body.name;
	}
	if (body.attribute !== undefined) {
		if (typeof body.attribute !== 'string' || body.attribute.length === 0) {
			error(400, 'attribute must be a non-empty string');
		}
		data.attribute = body.attribute;
	}
	if (body.match_type !== undefined) {
		if (!MATCH_TYPES.includes(body.match_type as (typeof MATCH_TYPES)[number])) {
			error(400, 'match_type is required');
		}
		data.match_type = body.match_type as CorrelationMatchType;
	}
	if (body.algorithm !== undefined) {
		if (body.algorithm !== null && !ALGORITHMS.includes(body.algorithm as (typeof ALGORITHMS)[number])) {
			error(400, 'algorithm is required');
		}
		data.algorithm = body.algorithm as CorrelationAlgorithm | null;
	}
	if (body.threshold !== undefined) {
		if (typeof body.threshold !== 'number') {
			error(400, 'threshold must be a number');
		}
		data.threshold = body.threshold;
	}
	if (body.weight !== undefined) {
		if (typeof body.weight !== 'number') {
			error(400, 'weight must be a number');
		}
		data.weight = body.weight;
	}
	if (body.is_active !== undefined) {
		if (typeof body.is_active !== 'boolean') {
			error(400, 'is_active must be a boolean');
		}
		data.is_active = body.is_active;
	}
	if (body.priority !== undefined) {
		if (typeof body.priority !== 'number') {
			error(400, 'priority must be a number');
		}
		data.priority = body.priority;
	}
	const result = await updateIdentityCorrelationRule(params.id, data, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
	await deleteIdentityCorrelationRule(params.id, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
