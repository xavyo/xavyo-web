import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listPolicySimulationResults } from '$lib/api/simulations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	try {
		const impact_type = url.searchParams.get('impact_type') ?? undefined;
		const severity = url.searchParams.get('severity') ?? undefined;
		const user_id = url.searchParams.get('user_id') ?? undefined;
		const offset = Number(url.searchParams.get('offset') ?? '0');
		const limit = Number(url.searchParams.get('limit') ?? '20');

		const result = await listPolicySimulationResults(
			params.id,
			{ impact_type, severity, user_id, offset, limit },
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
