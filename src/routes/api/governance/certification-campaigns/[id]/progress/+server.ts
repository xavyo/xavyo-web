import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCampaignProgress } from '$lib/api/governance';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getCampaignProgress(
		params.id,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
