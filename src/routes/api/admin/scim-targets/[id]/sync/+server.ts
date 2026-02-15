import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { triggerScimSync } from '$lib/api/scim-targets';
import { ApiError } from '$lib/api/client';

export const POST: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	try {
		const result = await triggerScimSync(params.id, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 202 });
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Sync trigger failed' }, { status: 500 });
	}
};
