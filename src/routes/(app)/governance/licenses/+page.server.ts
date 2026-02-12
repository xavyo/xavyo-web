import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { listLicensePools } from '$lib/api/licenses';
import { hasAdminRole } from '$lib/server/auth';
import type { LicensePoolListResponse } from '$lib/api/types';

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	// Extract filter params from URL
	const vendor = url.searchParams.get('vendor') || undefined;
	const license_type = url.searchParams.get('license_type') || undefined;
	const status = url.searchParams.get('status') || undefined;
	const limit = Number(url.searchParams.get('limit')) || 20;
	const offset = Number(url.searchParams.get('offset')) || 0;

	const pools = await listLicensePools(
		{ vendor, license_type, status, limit, offset },
		locals.accessToken!,
		locals.tenantId!,
		fetch
	).catch((): LicensePoolListResponse => ({ items: [], total: 0, limit: 20, offset: 0 }));

	return { pools };
};
