import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listPolicySimulations, createPolicySimulation } from '$lib/api/simulations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	try {
		const simulation_type = url.searchParams.get('simulation_type') ?? undefined;
		const status = url.searchParams.get('status') ?? undefined;
		const created_by = url.searchParams.get('created_by') ?? undefined;
		const include_archived = url.searchParams.get('include_archived') === 'true' ? true : undefined;
		const result = await listPolicySimulations(
			{ simulation_type, status, created_by, include_archived, ...listPagination(url) },
			locals.accessToken,
			locals.tenantId,
			fetch
		);

		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
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
	if (typeof body.name !== 'string' || body.name.length === 0) {
		error(400, 'name is required');
	}
	if (body.simulation_type !== 'sod_rule' && body.simulation_type !== 'birthright_policy') {
		error(400, 'simulation_type is required');
	}
	if (!body.policy_config || typeof body.policy_config !== 'object' || Array.isArray(body.policy_config)) {
		error(400, 'policy_config is required');
	}
	const data: Record<string, unknown> = {
		name: body.name,
		simulation_type: body.simulation_type,
		policy_config: body.policy_config
	};
	if (body.policy_id !== undefined && body.policy_id !== null) {
		if (typeof body.policy_id !== 'string') {
			error(400, 'policy_id must be a string');
		}
		data.policy_id = body.policy_id;
	} else {
		data.policy_id = null;
	}

	try {
		const result = await createPolicySimulation(data, locals.accessToken, locals.tenantId, fetch);

		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
