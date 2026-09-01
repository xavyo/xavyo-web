import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getBirthrightPolicy, updateBirthrightPolicy, archiveBirthrightPolicy } from '$lib/api/birthright';
import type { BirthrightCondition, UpdateBirthrightPolicyRequest } from '$lib/api/types';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';

const OPERATORS = ['equals', 'not_equals', 'in', 'not_in', 'starts_with', 'contains'] as const;

function parseConditions(value: unknown): BirthrightCondition[] {
	if (!Array.isArray(value) || value.length === 0) {
		error(400, 'conditions must be a non-empty array');
	}
	const conditions: BirthrightCondition[] = [];
	for (const item of value) {
		if (!item || typeof item !== 'object' || Array.isArray(item)) {
			error(400, 'each condition must be an object');
		}
		const condition = item as Record<string, unknown>;
		if (typeof condition.attribute !== 'string' || condition.attribute.length === 0) {
			error(400, 'attribute is required');
		}
		if (!OPERATORS.includes(condition.operator as (typeof OPERATORS)[number])) {
			error(400, 'operator is required');
		}
		if (
			typeof condition.value !== 'string' &&
			!(Array.isArray(condition.value) && condition.value.every((v) => typeof v === 'string'))
		) {
			error(400, 'value is required');
		}
		conditions.push({
			attribute: condition.attribute,
			operator: condition.operator as BirthrightCondition['operator'],
			value: condition.value as string | string[]
		});
	}
	return conditions;
}

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await getBirthrightPolicy(params.id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	const data: UpdateBirthrightPolicyRequest = {};
	if (body.name !== undefined) {
		if (typeof body.name !== 'string' || body.name.length === 0) {
			error(400, 'name must be a non-empty string');
		}
		data.name = body.name;
	}
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	if (body.priority !== undefined) {
		try {
			data.priority = parseBoundedInteger(body.priority, 0, 1_000_000, 'priority');
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
	}
	if (body.conditions !== undefined) {
		data.conditions = parseConditions(body.conditions);
	}
	if (body.entitlement_ids !== undefined) {
		if (
			!Array.isArray(body.entitlement_ids) ||
			!body.entitlement_ids.every((id) => typeof id === 'string')
		) {
			error(400, 'entitlement_ids must be an array of strings');
		}
		data.entitlement_ids = body.entitlement_ids;
	}
	if (body.evaluation_mode !== undefined) {
		if (body.evaluation_mode !== 'first_match' && body.evaluation_mode !== 'all_match') {
			error(400, 'evaluation_mode must be first_match or all_match');
		}
		data.evaluation_mode = body.evaluation_mode;
	}
	if (body.grace_period_days !== undefined) {
		try {
			data.grace_period_days = parseBoundedInteger(body.grace_period_days, 0, 365, 'grace_period_days');
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
	}
	const result = await updateBirthrightPolicy(
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
	const result = await archiveBirthrightPolicy(params.id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
