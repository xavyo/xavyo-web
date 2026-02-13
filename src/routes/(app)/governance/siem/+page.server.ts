import type { PageServerLoad } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import { listSiemDestinations, listSiemExports } from '$lib/api/siem';

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
	if (!locals.accessToken || !locals.tenantId) {
		redirect(302, '/login');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/');
	}

	const limit = Number(url.searchParams.get('limit') ?? 20);
	const offset = Number(url.searchParams.get('offset') ?? 0);

	const [destinations, exports] = await Promise.all([
		listSiemDestinations({ limit, offset }, locals.accessToken, locals.tenantId, fetch).catch(
			() => ({
				items: [],
				total: 0,
				limit,
				offset
			})
		),
		listSiemExports(
			{ limit: 20, offset: 0 },
			locals.accessToken,
			locals.tenantId,
			fetch
		).catch(() => ({
			items: [],
			total: 0,
			limit: 20,
			offset: 0
		}))
	]);

	return { destinations, exports };
};
