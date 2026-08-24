import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listSimulationComparisons, createSimulationComparison } from '$lib/api/simulations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	try {
		const comparison_type = url.searchParams.get('comparison_type') || undefined;
		const created_by = url.searchParams.get('created_by') || undefined;
		const offset = Number(url.searchParams.get('offset') ?? '0');
		const limit = Number(url.searchParams.get('limit') ?? '20');
		const result = await listSimulationComparisons(
			{ comparison_type, created_by, offset, limit },
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
	if (
		body.comparison_type !== 'simulation_vs_simulation' &&
		body.comparison_type !== 'simulation_vs_current'
	) {
		error(400, 'comparison_type is required');
	}
	if (typeof body.simulation_a_id !== 'string' || body.simulation_a_id.length === 0) {
		error(400, 'simulation_a_id is required');
	}
	if (body.simulation_a_type !== 'policy' && body.simulation_a_type !== 'batch') {
		error(400, 'simulation_a_type is required');
	}
	const data: Record<string, unknown> = {
		name: body.name,
		comparison_type: body.comparison_type,
		simulation_a_id: body.simulation_a_id,
		simulation_a_type: body.simulation_a_type
	};
	if (body.simulation_b_id !== undefined) {
		if (typeof body.simulation_b_id !== 'string') {
			error(400, 'simulation_b_id must be a string');
		}
		data.simulation_b_id = body.simulation_b_id;
	}
	if (body.simulation_b_type !== undefined) {
		if (body.simulation_b_type !== 'policy' && body.simulation_b_type !== 'batch') {
			error(400, 'simulation_b_type must be policy or batch');
		}
		data.simulation_b_type = body.simulation_b_type;
	}

	try {
		const result = await createSimulationComparison(data, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
