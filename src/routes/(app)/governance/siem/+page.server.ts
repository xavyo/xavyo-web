import type { PageServerLoad } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { error, redirect } from '@sveltejs/kit';
import { listSiemDestinations, listSiemExports } from '$lib/api/siem';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
	if (!locals.accessToken || !locals.tenantId) {
		redirect(302, '/login');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/');
	}

	const limit = Number(url.searchParams.get('limit') ?? 20);
	const offset = Number(url.searchParams.get('offset') ?? 0);

	try {
		const [destinations, exports] = await Promise.all([
			listSiemDestinations({ limit, offset }, locals.accessToken, locals.tenantId, fetch),
			listSiemExports({ limit: 20, offset: 0 }, locals.accessToken, locals.tenantId, fetch)
		]);
		return { destinations, exports };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load SIEM destinations');
	}
};
