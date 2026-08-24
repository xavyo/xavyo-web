import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { calculateRoleMetrics } from '$lib/api/role-mining';
import type { CalculateMetricsRequest } from '$lib/api/types';

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
	const data: CalculateMetricsRequest = {};
	if (body.role_ids !== undefined) {
		if (
			!Array.isArray(body.role_ids) ||
			body.role_ids.some((id) => typeof id !== 'string' || id.length === 0)
		) {
			error(400, 'role_ids must be an array of strings');
		}
		data.role_ids = body.role_ids as string[];
	}
	const result = await calculateRoleMetrics(data, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
