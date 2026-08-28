import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { listUserRiskEvents } from '$lib/api/risk';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const load: PageServerLoad = async ({ params, url, locals, fetch }) => {
	const event_type = url.searchParams.get('event_type') ?? undefined;
	const { limit = 50, offset = 0 } = listPagination(url);

	try {
		const events = await listUserRiskEvents(
			params.userId,
			{ event_type, limit, offset },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return { events, userId: params.userId, filters: { event_type } };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load risk events');
	}
};
