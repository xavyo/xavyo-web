import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { importTools } from '$lib/api/nhi-discovery';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Admin role required');
	}

	try {
		const body = await request.json();
		const result = await importTools(body.tools ?? [], locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		throw e;
	}
};
