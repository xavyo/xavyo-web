import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchAlerts } from '$lib/api/alerts';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const cursor = url.searchParams.get('cursor') ?? undefined;
	const { limit } = listPagination(url);
	const type = url.searchParams.get('type') ?? undefined;
	const severity = url.searchParams.get('severity') ?? undefined;
	const acknowledgedParam = url.searchParams.get('acknowledged');
	const acknowledged =
		acknowledgedParam === 'true' ? true : acknowledgedParam === 'false' ? false : undefined;

	const result = await fetchAlerts(
		{ cursor, limit, type, severity, acknowledged },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
