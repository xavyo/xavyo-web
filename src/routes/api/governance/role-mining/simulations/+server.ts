import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listSimulations, createSimulation } from '$lib/api/role-mining';
import type { CreateSimulationRequest, ScenarioType, SimulationChanges } from '$lib/api/types';
import { listPagination } from '$lib/server/list-pagination';

const SCENARIO_TYPES = [
	'add_entitlement',
	'remove_entitlement',
	'add_role',
	'remove_role',
	'modify_role'
] as const;

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const status = url.searchParams.get('status') || undefined;
	const scenario_type = url.searchParams.get('scenario_type') || undefined;

	const result = await listSimulations(
		{ status, scenario_type, ...listPagination(url) },
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
	if (!SCENARIO_TYPES.includes(body.scenario_type as (typeof SCENARIO_TYPES)[number])) {
		error(400, 'scenario_type is required');
	}
	if (!body.changes || typeof body.changes !== 'object' || Array.isArray(body.changes)) {
		error(400, 'changes is required');
	}
	const data: CreateSimulationRequest = {
		name: body.name,
		scenario_type: body.scenario_type as ScenarioType,
		changes: body.changes as SimulationChanges
	};
	if (body.target_role_id !== undefined) {
		if (typeof body.target_role_id !== 'string') {
			error(400, 'target_role_id must be a string');
		}
		data.target_role_id = body.target_role_id;
	}
	const result = await createSimulation(data, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
