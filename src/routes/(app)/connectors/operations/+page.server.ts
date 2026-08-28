import type { Actions, PageServerLoad } from './$types';
import { error, redirect, fail } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { listOperations, getOperationStats } from '$lib/api/operations';
import { listConnectors } from '$lib/api/connectors';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const connector_id = url.searchParams.get('connector_id') ?? undefined;
	const status = url.searchParams.get('status') ?? undefined;
	const operation_type = url.searchParams.get('operation_type') ?? undefined;
	const from_date = url.searchParams.get('from_date') ?? undefined;
	const to_date = url.searchParams.get('to_date') ?? undefined;
	const { limit = 20, offset = 0 } = listPagination(url);

	try {
		const [operations, stats, connectors] = await Promise.all([
			listOperations(
				{ connector_id, status, operation_type, from_date, to_date, limit, offset },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			),
			getOperationStats(connector_id, locals.accessToken!, locals.tenantId!, fetch),
			listConnectors(
				{ limit: 100, offset: 0 },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			)
		]);

		return { operations, stats, connectors: connectors.items };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load operations');
	}
};
