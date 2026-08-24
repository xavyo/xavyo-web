import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { applyBatchSimulation } from '$lib/api/simulations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	try {
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
		if (typeof body.justification !== 'string' || body.justification.length === 0) {
			error(400, 'justification is required');
		}
		if (body.acknowledge_scope !== true) {
			error(400, 'acknowledge_scope is required');
		}
		const result = await applyBatchSimulation(
			params.id,
			{ justification: body.justification, acknowledge_scope: true },
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
