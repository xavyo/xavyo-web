import type { PageServerLoad } from './$types';
import { listPoa } from '$lib/api/power-of-attorney';
import { listUsers } from '$lib/api/users';
import { hasAdminRole } from '$lib/server/auth';
import type { PoaListResponse } from '$lib/api/types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	let outgoing: PoaListResponse = { items: [], total: 0, limit: 20, offset: 0 };
	let userNameMap: Record<string, string> = {};

	try {
		const [poaResult, usersResult] = await Promise.all([
			listPoa(
				{ direction: 'outgoing', limit: 20, offset: 0 },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			),
			listUsers(
				{ limit: 200, offset: 0 },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			)
		]);
		outgoing = poaResult;
		for (const u of usersResult.users ?? []) {
			userNameMap[u.id] = (u as any).display_name ?? u.email;
		}
	} catch {
		// Fail silently — empty list shown
	}

	return {
		outgoing,
		userNameMap,
		isAdmin: hasAdminRole(locals.user?.roles)
	};
};
