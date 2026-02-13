import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchLoginHistory } from '$lib/api/audit';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const cursor = url.searchParams.get('cursor') ?? undefined;
	const limit = url.searchParams.get('limit')
		? Number(url.searchParams.get('limit'))
		: undefined;
	const start_date = url.searchParams.get('start_date') ?? undefined;
	const end_date = url.searchParams.get('end_date') ?? undefined;
	const successParam = url.searchParams.get('success');
	const success =
		successParam === 'true' ? true : successParam === 'false' ? false : undefined;

	const result = await fetchLoginHistory(
		{ cursor, limit, start_date, end_date, success },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
