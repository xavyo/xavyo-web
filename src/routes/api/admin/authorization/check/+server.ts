import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { checkAuthorization } from '$lib/api/authorization';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const user_id = url.searchParams.get('user_id') ?? '';
	const action = url.searchParams.get('action') ?? '';
	const resource_type = url.searchParams.get('resource_type') ?? '';
	const resource_id = url.searchParams.get('resource_id') || undefined;

	const result = await checkAuthorization(
		{ user_id, action, resource_type, resource_id },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
