import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listBirthrightPolicies, createBirthrightPolicy } from '$lib/api/birthright';
import { listPagination } from '$lib/server/list-pagination';
import type { BirthrightCondition, CreateBirthrightPolicyRequest } from '$lib/api/types';

const OPERATORS = ['equals', 'not_equals', 'in', 'not_in', 'starts_with', 'contains'] as const;

function parseConditions(value: unknown): BirthrightCondition[] {
	if (!Array.isArray(value) || value.length === 0) {
		error(400, 'conditions is required');
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

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const status = url.searchParams.get('status') ?? undefined;
	const result = await listBirthrightPolicies(
		{ status, ...listPagination(url) },
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
	if (typeof body.priority !== 'number') {
		error(400, 'priority is required');
	}
	if (!Array.isArray(body.entitlement_ids) || !body.entitlement_ids.every((id) => typeof id === 'string')) {
		error(400, 'entitlement_ids is required');
	}
	const data: CreateBirthrightPolicyRequest = {
		name: body.name,
		priority: body.priority,
		conditions: parseConditions(body.conditions),
		entitlement_ids: body.entitlement_ids
	};
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	if (body.evaluation_mode !== undefined) {
		if (body.evaluation_mode !== 'first_match' && body.evaluation_mode !== 'all_match') {
			error(400, 'evaluation_mode must be first_match or all_match');
		}
		data.evaluation_mode = body.evaluation_mode;
	}
	if (body.grace_period_days !== undefined) {
		if (typeof body.grace_period_days !== 'number') {
			error(400, 'grace_period_days must be a number');
		}
		data.grace_period_days = body.grace_period_days;
	}
	const result = await createBirthrightPolicy(data, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
