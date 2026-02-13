import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { listRoles } from '$lib/api/governance-roles';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const offset = Number(url.searchParams.get('offset') ?? '0');
	const limit = Number(url.searchParams.get('limit') ?? '20');

	let roles = { items: [] as any[], total: 0, limit, offset };
	try {
		roles = await listRoles({ limit, offset }, locals.accessToken!, locals.tenantId!, fetch);
	} catch {
		// If roles fail to load, show empty state
	}

	return { roles };
};
