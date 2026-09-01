import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listScimProvisioningState } from '$lib/api/scim-targets';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	try {
		const resource_type = url.searchParams.get('resource_type') ?? undefined;
		const status = url.searchParams.get('status') ?? undefined;
		const result = await listScimProvisioningState(
			params.id,
			{ resource_type, status, ...listPagination(url) },
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to fetch provisioning state' }, { status: 500 });
	}
};
