import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getOperationStats } from '$lib/api/operations';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const connector_id = url.searchParams.get('connector_id') ?? undefined;

	const result = await getOperationStats(connector_id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
