import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { dryRunScriptVersion } from '$lib/api/provisioning-scripts';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const versionNumber = parseInt(params.versionNumber);
	const body = await request.json();
	const result = await dryRunScriptVersion(
		params.id,
		versionNumber,
		body,
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
