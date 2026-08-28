import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { compareScriptVersions } from '$lib/api/provisioning-scripts';
import { finiteNumber } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const from = finiteNumber(url.searchParams.get('from'));
	const to = finiteNumber(url.searchParams.get('to'));
	if (from == null) error(400, 'from is required');
	if (to == null) error(400, 'to is required');

	const result = await compareScriptVersions(
		params.id,
		from,
		to,
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
