import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getScriptVersion } from '$lib/api/provisioning-scripts';
import { finiteInteger } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const versionNumber = finiteInteger(params.versionNumber);
	if (versionNumber == null || versionNumber < 1) {
		error(400, 'Invalid version number');
	}
	const result = await getScriptVersion(
		params.id,
		versionNumber,
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
