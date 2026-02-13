import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updatePolicySimulationNotes } from '$lib/api/simulations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const PATCH: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	try {
		const body = await request.json();
		const result = await updatePolicySimulationNotes(
			params.id,
			body.notes,
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
