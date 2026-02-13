import type { PageServerLoad } from './$types';
import { listBirthrightPolicies } from '$lib/api/birthright';
import { hasAdminRole } from '$lib/server/auth';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	const status = url.searchParams.get('status') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listBirthrightPolicies({ status, limit, offset }, locals.accessToken, locals.tenantId, fetch);
	return { policies: result.items, total: result.total, filters: { status } };
};
