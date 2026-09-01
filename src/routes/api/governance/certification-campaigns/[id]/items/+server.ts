import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listCampaignItems } from '$lib/api/governance';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await listCampaignItems(
		params.id,
		{
			status: url.searchParams.get('status') ?? undefined,
			reviewer_id: url.searchParams.get('reviewer_id') ?? undefined,
			...listPagination(url)
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
