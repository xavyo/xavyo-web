import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { compareScriptVersions } from '$lib/api/provisioning-scripts';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const from = Number(url.searchParams.get('from'));
	const to = Number(url.searchParams.get('to'));

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
