import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { listPolicies } from '$lib/api/authorization';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const { limit = 20, offset = 0 } = listPagination(url);

	try {
		const result = await listPolicies(
			{ limit, offset },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return { policies: result.items, total: result.total, limit, offset };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load authorization policies');
	}
};
