import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listMcpTools } from '$lib/api/mcp';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const nhi_id = url.searchParams.get('nhi_id');
	if (!nhi_id) {
		error(400, 'Missing required query parameter: nhi_id');
	}

	const result = await listMcpTools({ nhi_id }, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
