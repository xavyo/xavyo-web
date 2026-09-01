import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listDetectionRules, createDetectionRule } from '$lib/api/detection-rules';
import type { CreateDetectionRuleRequest } from '$lib/api/types';
import { listPagination } from '$lib/server/list-pagination';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const rule_type = url.searchParams.get('rule_type') ?? undefined;
	const is_enabled =
		url.searchParams.get('is_enabled') === 'true'
			? true
			: url.searchParams.get('is_enabled') === 'false'
				? false
				: undefined;
	const result = await listDetectionRules(
		{ rule_type, is_enabled, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
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
	if (
		body.rule_type !== 'no_manager' &&
		body.rule_type !== 'terminated' &&
		body.rule_type !== 'inactive' &&
		body.rule_type !== 'custom'
	) {
		error(400, 'rule_type is required');
	}
	if (typeof body.is_enabled !== 'boolean') {
		error(400, 'is_enabled is required');
	}
	let priority: number;
	try {
		priority = parseBoundedInteger(body.priority, 1, 1_000_000, 'priority');
	} catch (e) {
		if (e instanceof JsonObjectError) error(400, e.message);
		throw e;
	}
	const data: CreateDetectionRuleRequest = {
		name: body.name,
		rule_type: body.rule_type,
		is_enabled: body.is_enabled,
		priority
	};
	if (body.parameters !== undefined) {
		if (!body.parameters || typeof body.parameters !== 'object' || Array.isArray(body.parameters)) {
			error(400, 'parameters must be an object');
		}
		data.parameters = body.parameters as Record<string, unknown>;
	}
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	const result = await createDetectionRule(data, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
