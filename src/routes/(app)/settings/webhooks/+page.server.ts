import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { listWebhookSubscriptions } from '$lib/api/webhooks';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	const { limit = 20, offset = 0 } = listPagination(url);

	try {
		const result = await listWebhookSubscriptions(
			{ limit, offset },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return { subscriptions: result.items, total: result.total, limit, offset };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load webhooks');
	}
};
