import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listMyCertifications } from '$lib/api/my-certifications';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const campaign_id = url.searchParams.get('campaign_id') ?? undefined;
	const status = url.searchParams.get('status') ?? undefined;
	const page = url.searchParams.get('page') ? Number(url.searchParams.get('page')) : undefined;
	const page_size = url.searchParams.get('page_size')
		? Number(url.searchParams.get('page_size'))
		: undefined;

	const result = await listMyCertifications(
		{ campaign_id, status, page, page_size },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
