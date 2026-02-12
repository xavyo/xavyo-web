import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { listBirthrightPolicies, listLifecycleEvents } from '$lib/api/birthright';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const statusFilter = url.searchParams.get('status') ?? undefined;

	const [policies, events] = await Promise.all([
		listBirthrightPolicies(
			{ status: statusFilter, limit: 50, offset: 0 },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		).catch(() => ({ items: [], total: 0, limit: 50, offset: 0 })),
		listLifecycleEvents(
			{ limit: 50, offset: 0 },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		).catch(() => ({ items: [], total: 0, limit: 50, offset: 0 }))
	]);

	return { policies, events };
};
