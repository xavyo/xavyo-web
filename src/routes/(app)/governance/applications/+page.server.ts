import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { listApplications } from '$lib/api/governance';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');
	const status = url.searchParams.get('status') ?? undefined;
	const app_type = url.searchParams.get('app_type') ?? undefined;

	const result = await listApplications(
		{ status, app_type, limit, offset },
		locals.accessToken!,
		locals.tenantId!,
		fetch
	);

	return {
		applications: result.items,
		total: result.total,
		limit,
		offset
	};
};
