import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { listConnectors } from '$lib/api/connectors';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {

	const name_contains = url.searchParams.get('name_contains') ?? undefined;
	const connector_type = url.searchParams.get('connector_type') ?? undefined;
	const status = url.searchParams.get('status') ?? undefined;
	const { limit = 20, offset = 0 } = listPagination(url);

	try {
		const result = await listConnectors(
			{ name_contains, connector_type, status, limit, offset },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return { connectors: result };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load connectors');
	}
};
