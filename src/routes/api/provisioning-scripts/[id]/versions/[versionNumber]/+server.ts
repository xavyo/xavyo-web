import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getScriptVersion } from '$lib/api/provisioning-scripts';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const versionNumber = parseInt(params.versionNumber);
	const result = await getScriptVersion(
		params.id,
		versionNumber,
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
