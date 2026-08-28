import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { listBirthrightPolicies, listLifecycleEvents } from '$lib/api/birthright';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, fetch, url }) => {

	const statusFilter = url.searchParams.get('status') ?? undefined;

	try {
		const [policies, events] = await Promise.all([
			listBirthrightPolicies(
				{ status: statusFilter, limit: 50, offset: 0 },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			),
			listLifecycleEvents(
				{ limit: 50, offset: 0 },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			)
		]);
		return { policies, events };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load birthright policies');
	}
};
