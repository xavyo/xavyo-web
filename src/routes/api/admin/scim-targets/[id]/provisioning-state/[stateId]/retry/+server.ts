import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { retryScimProvisioning } from '$lib/api/scim-targets';
import { ApiError } from '$lib/api/client';

export const POST: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		await retryScimProvisioning(params.id, params.stateId, locals.accessToken, locals.tenantId, fetch);
		return json({ message: 'Retry initiated' });
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Provisioning retry failed' }, { status: 500 });
	}
};
