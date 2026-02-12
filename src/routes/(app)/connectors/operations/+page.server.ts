import type { Actions, PageServerLoad } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { listOperations, getOperationStats } from '$lib/api/operations';
import { listConnectors } from '$lib/api/connectors';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const connector_id = url.searchParams.get('connector_id') ?? undefined;
	const status = url.searchParams.get('status') ?? undefined;
	const operation_type = url.searchParams.get('operation_type') ?? undefined;
	const from_date = url.searchParams.get('from_date') ?? undefined;
	const to_date = url.searchParams.get('to_date') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	try {
		const [operations, stats, connectors] = await Promise.all([
			listOperations(
				{ connector_id, status, operation_type, from_date, to_date, limit, offset },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			),
			getOperationStats(
				connector_id,
				locals.accessToken!,
				locals.tenantId!,
				fetch
			).catch(() => null),
			listConnectors(
				{ limit: 100, offset: 0 },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			).catch(() => ({ items: [], total: 0, limit: 100, offset: 0 }))
		]);

		return { operations, stats, connectors: connectors.items };
	} catch {
		return {
			operations: { operations: [], total: 0, limit, offset },
			stats: null,
			connectors: []
		};
	}
};
