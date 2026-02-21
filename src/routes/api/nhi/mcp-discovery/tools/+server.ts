import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { discoverTools } from '$lib/api/nhi-discovery';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Admin role required');
	}

	try {
		const gatewayName = url.searchParams.get('gateway_name') ?? undefined;
		const result = await discoverTools(gatewayName, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		throw e;
	}
};
