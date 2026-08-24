import type { PageServerLoad } from './$types';
import { listDelegationGrants } from '$lib/api/nhi-delegations';
import { error } from '@sveltejs/kit';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, url, fetch }) => {
	const principal_id = url.searchParams.get('principal_id') || '';
	const actor_nhi_id = url.searchParams.get('actor_nhi_id') || '';
	const status = url.searchParams.get('status') || '';
	const filters = { principal_id, actor_nhi_id, status };

	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	// Backend requires at least principal_id or actor_nhi_id
	if (!principal_id && !actor_nhi_id) {
		return { grants: [], hasMore: false, needsFilter: true, filters };
	}

	const limit = 20;

	try {
		const result = await listDelegationGrants(
			{
				principal_id: principal_id || undefined,
				actor_nhi_id: actor_nhi_id || undefined,
				status: status || undefined,
				limit,
				offset: 0
			},
			locals.accessToken,
			locals.tenantId,
			fetch
		);

		return {
			grants: result.data,
			hasMore: result.data.length >= limit,
			needsFilter: false,
			filters
		};
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load NHI delegations');
	}
};
