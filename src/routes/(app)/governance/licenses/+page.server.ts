import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { listLicensePools } from '$lib/api/licenses';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	// Extract filter params from URL
	const vendor = url.searchParams.get('vendor') || undefined;
	const license_type = url.searchParams.get('license_type') || undefined;
	const status = url.searchParams.get('status') || undefined;
	const { limit = 20, offset = 0 } = listPagination(url);

	try {
		const pools = await listLicensePools(
			{ vendor, license_type, status, limit, offset },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return { pools };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load license pools');
	}
};
