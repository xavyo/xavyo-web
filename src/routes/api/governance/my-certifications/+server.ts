import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listMyCertifications } from '$lib/api/my-certifications';
import { pagePagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const campaign_id = url.searchParams.get('campaign_id') ?? undefined;
	const status = url.searchParams.get('status') ?? undefined;

	const result = await listMyCertifications(
		{ campaign_id, status, ...pagePagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
