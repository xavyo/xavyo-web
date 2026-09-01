import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { adminListPoa } from '$lib/api/power-of-attorney';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const donor_id = url.searchParams.get('donor_id') ?? undefined;
	const attorney_id = url.searchParams.get('attorney_id') ?? undefined;
	const status = url.searchParams.get('status') ?? undefined;
	const active_now =
		url.searchParams.get('active_now') === 'true'
			? true
			: url.searchParams.get('active_now') === 'false'
				? false
				: undefined;

	const result = await adminListPoa(
		{ donor_id, attorney_id, status, active_now, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
