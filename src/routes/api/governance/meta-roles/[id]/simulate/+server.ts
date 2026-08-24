import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { simulateMetaRole } from '$lib/api/meta-roles';
import type { CriteriaOperator, SimulateMetaRoleRequest } from '$lib/api/types';

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

const SIMULATION_TYPES = [
	'create',
	'update',
	'delete',
	'criteria_change',
	'enable',
	'disable'
] as const;

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
	if (!SIMULATION_TYPES.includes(body.simulation_type as (typeof SIMULATION_TYPES)[number])) {
		error(400, 'simulation_type is required');
	}
	const data: SimulateMetaRoleRequest = { simulation_type: body.simulation_type as SimulateMetaRoleRequest['simulation_type'] };
	if (body.meta_role_id !== undefined) {
		if (typeof body.meta_role_id !== 'string') {
			error(400, 'meta_role_id must be a string');
		}
		data.meta_role_id = body.meta_role_id;
	}
	if (body.limit !== undefined) {
		if (typeof body.limit !== 'number') {
			error(400, 'limit must be a number');
		}
		data.limit = body.limit;
	}
	if (body.meta_role_data !== undefined) {
		if (
			!body.meta_role_data ||
			typeof body.meta_role_data !== 'object' ||
			Array.isArray(body.meta_role_data)
		) {
			error(400, 'meta_role_data must be an object');
		}
		const role = body.meta_role_data as Record<string, unknown>;
		if (typeof role.name !== 'string' || role.name.length === 0) {
			error(400, 'name is required');
		}
		if (typeof role.priority !== 'number') {
			error(400, 'priority is required');
		}
		data.meta_role_data = { name: role.name, priority: role.priority };
		if (typeof role.description === 'string') {
			data.meta_role_data.description = role.description;
		}
	}
	if (body.criteria_changes !== undefined) {
		if (!Array.isArray(body.criteria_changes)) {
			error(400, 'criteria_changes must be an array');
		}
		const changes: NonNullable<SimulateMetaRoleRequest['criteria_changes']> = [];
		for (const item of body.criteria_changes) {
			if (!item || typeof item !== 'object' || Array.isArray(item)) {
				error(400, 'each criteria change must be an object');
			}
			const change = item as Record<string, unknown>;
			if (typeof change.field !== 'string' || change.field.length === 0) {
				error(400, 'field is required');
			}
			if (!OPERATORS.includes(change.operator as CriteriaOperator)) {
				error(400, 'operator is required');
			}
			if (change.value === undefined) {
				error(400, 'value is required');
			}
			changes.push({
				field: change.field,
				operator: change.operator as CriteriaOperator,
				value: change.value
			});
		}
		data.criteria_changes = changes;
	}
	const result = await simulateMetaRole(params.id, data, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
