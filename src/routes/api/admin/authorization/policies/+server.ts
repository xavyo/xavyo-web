import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listPolicies, createPolicy } from '$lib/api/authorization';
import type { CreateConditionRequest, CreatePolicyRequest } from '$lib/api/types';
import { listPagination } from '$lib/server/list-pagination';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';

const CONDITION_TYPES = ['time_window', 'user_attribute', 'entitlement_check'] as const;
const CONDITION_OPERATORS = ['equals', 'not_equals', 'contains', 'in_list'] as const;

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const status = url.searchParams.get('status') ?? undefined;
	const effect = url.searchParams.get('effect') ?? undefined;

	const result = await listPolicies(
		{ status, effect, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

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
	if (typeof body.name !== 'string' || body.name.length === 0) {
		error(400, 'name is required');
	}
	if (body.effect !== 'allow' && body.effect !== 'deny') {
		error(400, 'effect is required');
	}
	let priority: number | undefined;
	if (body.priority !== undefined) {
		try {
			priority = parseBoundedInteger(body.priority, 0, 1_000_000, 'priority');
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
	}
	const data: CreatePolicyRequest = {
		name: body.name,
		effect: body.effect,
		description: typeof body.description === 'string' ? body.description : undefined,
		priority,
		resource_type: typeof body.resource_type === 'string' ? body.resource_type : undefined,
		action: typeof body.action === 'string' ? body.action : undefined
	};
	if (body.conditions !== undefined) {
		if (!Array.isArray(body.conditions)) {
			error(400, 'conditions must be an array');
		}
		const conditions: CreateConditionRequest[] = [];
		for (const item of body.conditions) {
			if (!item || typeof item !== 'object' || Array.isArray(item)) {
				error(400, 'conditions must be objects');
			}
			const condition = item as Record<string, unknown>;
			if (!CONDITION_TYPES.includes(condition.condition_type as (typeof CONDITION_TYPES)[number])) {
				error(400, 'condition_type is required');
			}
			if (condition.value === undefined) {
				error(400, 'value is required');
			}
			const parsedCondition: CreateConditionRequest = {
				condition_type: condition.condition_type as CreateConditionRequest['condition_type'],
				value: condition.value
			};
			if (condition.attribute_path !== undefined) {
				if (typeof condition.attribute_path !== 'string') {
					error(400, 'attribute_path must be a string');
				}
				parsedCondition.attribute_path = condition.attribute_path;
			}
			if (condition.operator !== undefined) {
				if (
					!CONDITION_OPERATORS.includes(condition.operator as (typeof CONDITION_OPERATORS)[number])
				) {
					error(400, 'operator is required');
				}
				parsedCondition.operator = condition.operator as CreateConditionRequest['operator'];
			}
			conditions.push(parsedCondition);
		}
		data.conditions = conditions;
	}
	const result = await createPolicy(
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result, { status: 201 });
};
