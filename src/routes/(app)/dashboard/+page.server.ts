import type { PageServerLoad } from './$types';
import { listUsers } from '$lib/api/users';
import { listPersonas } from '$lib/api/personas';
import { listNhi } from '$lib/api/nhi';
import { fetchAdminLoginAttempts } from '$lib/api/audit';

export const load: PageServerLoad = async ({ parent, locals, fetch }) => {
	const { user } = await parent();

	let totalUsers = 0;
	let activePersonas = 0;
	let nhiIdentities = 0;
	let recentActivity = 0;

	const token = locals.accessToken!;
	const tenantId = locals.tenantId!;

	const [usersResult, personasResult, nhiResult, activityResult] = await Promise.allSettled([
		listUsers({ limit: 1 }, token, tenantId, fetch),
		listPersonas({ limit: 1, lifecycle_state: 'active' }, token, tenantId, fetch),
		listNhi({ limit: 1 }, token, tenantId, fetch),
		fetchAdminLoginAttempts({ limit: 1 }, token, tenantId, fetch)
	]);

	if (usersResult.status === 'fulfilled') {
		totalUsers = usersResult.value.pagination?.total_count ?? 0;
	}
	if (personasResult.status === 'fulfilled') {
		activePersonas = personasResult.value.total ?? 0;
	}
	if (nhiResult.status === 'fulfilled') {
		nhiIdentities = nhiResult.value.total ?? 0;
	}
	if (activityResult.status === 'fulfilled') {
		recentActivity = activityResult.value.total ?? activityResult.value.items?.length ?? 0;
	}

	return { user, totalUsers, activePersonas, nhiIdentities, recentActivity };
};
