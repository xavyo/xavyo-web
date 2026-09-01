import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listMetaRoles, createMetaRole } from '$lib/api/meta-roles';
import { listPagination } from '$lib/server/list-pagination';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';
import type {
	AddMetaRoleConstraintRequest,
	AddMetaRoleCriterionRequest,
	AddMetaRoleEntitlementRequest,
	CreateMetaRoleRequest,
	CriteriaOperator
} from '$lib/api/types';

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

function parseCriteria(value: unknown): AddMetaRoleCriterionRequest[] {
	if (!Array.isArray(value)) {
		error(400, 'criteria must be an array');
	}
	const criteria: AddMetaRoleCriterionRequest[] = [];
	for (const item of value) {
		if (!item || typeof item !== 'object' || Array.isArray(item)) {
			error(400, 'each criterion must be an object');
		}
		const criterion = item as Record<string, unknown>;
		if (typeof criterion.field !== 'string' || criterion.field.length === 0) {
			error(400, 'field is required');
		}
		if (!OPERATORS.includes(criterion.operator as CriteriaOperator)) {
			error(400, 'operator is required');
		}
		if (criterion.value === undefined) {
			error(400, 'value is required');
		}
		criteria.push({
			field: criterion.field,
			operator: criterion.operator as CriteriaOperator,
			value: criterion.value
		});
	}
	return criteria;
}

function parseEntitlements(value: unknown): AddMetaRoleEntitlementRequest[] {
	if (!Array.isArray(value)) {
		error(400, 'entitlements must be an array');
	}
	const entitlements: AddMetaRoleEntitlementRequest[] = [];
	for (const item of value) {
		if (!item || typeof item !== 'object' || Array.isArray(item)) {
			error(400, 'each entitlement must be an object');
		}
		const entitlement = item as Record<string, unknown>;
		if (typeof entitlement.entitlement_id !== 'string' || entitlement.entitlement_id.length === 0) {
			error(400, 'entitlement_id is required');
		}
		const parsed: AddMetaRoleEntitlementRequest = { entitlement_id: entitlement.entitlement_id };
		if (entitlement.permission_type !== undefined) {
			if (entitlement.permission_type !== 'grant' && entitlement.permission_type !== 'deny') {
				error(400, 'permission_type must be grant or deny');
			}
			parsed.permission_type = entitlement.permission_type;
		}
		entitlements.push(parsed);
	}
	return entitlements;
}

function parseConstraints(value: unknown): AddMetaRoleConstraintRequest[] {
	if (!Array.isArray(value)) {
		error(400, 'constraints must be an array');
	}
	const constraints: AddMetaRoleConstraintRequest[] = [];
	for (const item of value) {
		if (!item || typeof item !== 'object' || Array.isArray(item)) {
			error(400, 'each constraint must be an object');
		}
		const constraint = item as Record<string, unknown>;
		if (
			constraint.constraint_type !== 'max_session_duration' &&
			constraint.constraint_type !== 'require_mfa' &&
			constraint.constraint_type !== 'ip_whitelist' &&
			constraint.constraint_type !== 'approval_required'
		) {
			error(400, 'constraint_type is required');
		}
		if (
			!constraint.constraint_value ||
			typeof constraint.constraint_value !== 'object' ||
			Array.isArray(constraint.constraint_value)
		) {
			error(400, 'constraint_value is required');
		}
		constraints.push({
			constraint_type: constraint.constraint_type,
			constraint_value: constraint.constraint_value as Record<string, unknown>
		});
	}
	return constraints;
}

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const status = url.searchParams.get('status') ?? undefined;
	const name = url.searchParams.get('name') ?? undefined;
	const created_by = url.searchParams.get('created_by') ?? undefined;

	const result = await listMetaRoles(
		{ status, name, created_by, ...listPagination(url) },
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
	let priority: number;
	try {
		priority = parseBoundedInteger(body.priority, 1, 1000, 'priority');
	} catch (e) {
		if (e instanceof JsonObjectError) error(400, e.message);
		throw e;
	}
	const data: CreateMetaRoleRequest = { name: body.name, priority };
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	if (body.criteria_logic !== undefined) {
		if (body.criteria_logic !== 'and' && body.criteria_logic !== 'or') {
			error(400, 'criteria_logic must be and or or');
		}
		data.criteria_logic = body.criteria_logic;
	}
	if (body.criteria !== undefined) {
		data.criteria = parseCriteria(body.criteria);
	}
	if (body.entitlements !== undefined) {
		data.entitlements = parseEntitlements(body.entitlements);
	}
	if (body.constraints !== undefined) {
		data.constraints = parseConstraints(body.constraints);
	}
	const result = await createMetaRole(data, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
