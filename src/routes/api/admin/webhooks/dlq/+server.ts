import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listDlqEntries } from '$lib/api/webhooks';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const include_replayed =
		url.searchParams.get('include_replayed') === 'true'
			? true
			: url.searchParams.get('include_replayed') === 'false'
				? false
				: undefined;

	const result = await listDlqEntries(
		{
			subscription_id: url.searchParams.get('subscription_id') ?? undefined,
			event_type: url.searchParams.get('event_type') ?? undefined,
			from: url.searchParams.get('from') ?? undefined,
			to: url.searchParams.get('to') ?? undefined,
			include_replayed,
			...listPagination(url)
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
