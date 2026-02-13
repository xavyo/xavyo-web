import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listBindingsByConnector } from '$lib/api/provisioning-scripts';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const result = await listBindingsByConnector(
		params.connectorId,
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
