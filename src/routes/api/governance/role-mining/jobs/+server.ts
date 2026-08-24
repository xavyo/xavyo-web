import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listMiningJobs, createMiningJob } from '$lib/api/role-mining';
import type { CreateMiningJobRequest, MiningJobParameters } from '$lib/api/types';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const status = url.searchParams.get('status') || undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listMiningJobs(
		{ status, limit, offset },
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
	const data: CreateMiningJobRequest = { name: body.name };
	if (body.parameters !== undefined) {
		if (!body.parameters || typeof body.parameters !== 'object' || Array.isArray(body.parameters)) {
			error(400, 'parameters must be an object');
		}
		const p = body.parameters as Record<string, unknown>;
		const parameters: MiningJobParameters = {};
		if (p.min_users !== undefined) {
			if (typeof p.min_users !== 'number') {
				error(400, 'min_users must be a number');
			}
			parameters.min_users = p.min_users;
		}
		if (p.min_entitlements !== undefined) {
			if (typeof p.min_entitlements !== 'number') {
				error(400, 'min_entitlements must be a number');
			}
			parameters.min_entitlements = p.min_entitlements;
		}
		if (p.confidence_threshold !== undefined) {
			if (typeof p.confidence_threshold !== 'number') {
				error(400, 'confidence_threshold must be a number');
			}
			parameters.confidence_threshold = p.confidence_threshold;
		}
		if (p.include_excessive_privilege !== undefined) {
			if (typeof p.include_excessive_privilege !== 'boolean') {
				error(400, 'include_excessive_privilege must be a boolean');
			}
			parameters.include_excessive_privilege = p.include_excessive_privilege;
		}
		if (p.include_consolidation !== undefined) {
			if (typeof p.include_consolidation !== 'boolean') {
				error(400, 'include_consolidation must be a boolean');
			}
			parameters.include_consolidation = p.include_consolidation;
		}
		if (p.consolidation_threshold !== undefined) {
			if (typeof p.consolidation_threshold !== 'number') {
				error(400, 'consolidation_threshold must be a number');
			}
			parameters.consolidation_threshold = p.consolidation_threshold;
		}
		if (p.deviation_threshold !== undefined) {
			if (typeof p.deviation_threshold !== 'number') {
				error(400, 'deviation_threshold must be a number');
			}
			parameters.deviation_threshold = p.deviation_threshold;
		}
		if (p.peer_group_attribute !== undefined) {
			if (p.peer_group_attribute !== null && typeof p.peer_group_attribute !== 'string') {
				error(400, 'peer_group_attribute must be a string or null');
			}
			parameters.peer_group_attribute = p.peer_group_attribute as string | null;
		}
		data.parameters = parameters;
	}
	const result = await createMiningJob(data, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
