import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { listUsers } from '$lib/api/users';
import { listPersonas } from '$lib/api/personas';
import { listNhi } from '$lib/api/nhi';
import { fetchAdminLoginAttempts } from '$lib/api/audit';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ parent, locals, fetch }) => {
	const { user } = await parent();

	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		const [usersResult, personasResult, nhiResult, activityResult] = await Promise.all([
			listUsers({ limit: 1 }, locals.accessToken, locals.tenantId, fetch),
			listPersonas({ limit: 1, status: 'active' }, locals.accessToken, locals.tenantId, fetch),
			listNhi({ limit: 1 }, locals.accessToken, locals.tenantId, fetch),
			fetchAdminLoginAttempts({ limit: 1 }, locals.accessToken, locals.tenantId, fetch)
		]);

		return {
			user,
			totalUsers: usersResult.pagination?.total_count ?? 0,
			activePersonas: personasResult.total ?? 0,
			nhiIdentities: nhiResult.total ?? 0,
			recentActivity: activityResult.total ?? activityResult.items?.length ?? 0
		};
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load dashboard');
	}
};
