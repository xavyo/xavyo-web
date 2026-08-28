import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { listRoles } from '$lib/api/governance-roles';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const { limit = 20, offset = 0 } = listPagination(url);

	try {
		const roles = await listRoles(
			{ limit, offset },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return { roles };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load roles');
	}
};
