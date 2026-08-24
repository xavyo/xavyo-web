import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addCriterion } from '$lib/api/meta-roles';
import type { AddMetaRoleCriterionRequest, CriteriaOperator } from '$lib/api/types';

const OPERATORS: CriteriaOperator[] = [
	'eq',
	'neq',
	'in',
	'not_in',
	'gt',
	'gte',
	'lt',
	'lte',
	'contains',
	'starts_with'
];

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	if (typeof body.field !== 'string' || body.field.length === 0) {
		error(400, 'field is required');
	}
	if (!OPERATORS.includes(body.operator as CriteriaOperator)) {
		error(400, 'operator is required');
	}
	if (body.value === undefined) {
		error(400, 'value is required');
	}
	const data: AddMetaRoleCriterionRequest = {
		field: body.field,
		operator: body.operator as CriteriaOperator,
		value: body.value
	};
	const result = await addCriterion(params.id, data, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
