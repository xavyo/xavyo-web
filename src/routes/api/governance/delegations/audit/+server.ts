import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listDelegationAudit } from '$lib/api/governance';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const delegation_id = url.searchParams.get('delegation_id') ?? undefined;
	const deputy_id = url.searchParams.get('deputy_id') ?? undefined;
	const delegator_id = url.searchParams.get('delegator_id') ?? undefined;
	const action_type = url.searchParams.get('action_type') ?? undefined;
	const work_item_type = url.searchParams.get('work_item_type') ?? undefined;
	const from_date = url.searchParams.get('from_date') ?? undefined;
	const to_date = url.searchParams.get('to_date') ?? undefined;

	const result = await listDelegationAudit(
		{
			delegation_id,
			deputy_id,
			delegator_id,
			action_type,
			work_item_type,
			from_date,
			to_date,
			...listPagination(url)
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
