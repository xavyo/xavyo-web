import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPolicySimulation, deletePolicySimulation } from '$lib/api/simulations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	try {
		const result = await getPolicySimulation(params.id, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	try {
		await deletePolicySimulation(params.id, locals.accessToken, locals.tenantId, fetch);
		return new Response(null, { status: 204 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
