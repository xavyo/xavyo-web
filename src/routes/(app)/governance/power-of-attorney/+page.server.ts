import type { PageServerLoad } from './$types';
import { listPoa } from '$lib/api/power-of-attorney';
import { listUsers } from '$lib/api/users';
import { hasAdminRole } from '$lib/server/auth';
import { error } from '@sveltejs/kit';
import { ApiError } from '$lib/api/client';
import type { PoaListResponse } from '$lib/api/types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const isAdmin = hasAdminRole(locals.user?.roles);
	let outgoing: PoaListResponse;
	try {
		outgoing = await listPoa(
			{ direction: 'outgoing', limit: 20, offset: 0 },
			locals.accessToken,
			locals.tenantId,
			fetch
		);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load power of attorney grants');
	}

	const userNameMap: Record<string, string> = {};
	if (isAdmin) {
		try {
			const usersResult = await listUsers(
				{ limit: 200, offset: 0 },
				locals.accessToken,
				locals.tenantId,
				fetch
			);
			for (const u of usersResult.users ?? []) {
				userNameMap[u.id] = (u as { display_name?: string }).display_name ?? u.email;
			}
		} catch {
			// Name map is display-only; a 403 here must not hide self-service PoA.
		}
	}

	return {
		outgoing,
		userNameMap,
		isAdmin
	};
};
