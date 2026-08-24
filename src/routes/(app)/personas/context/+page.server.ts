import type { PageServerLoad } from './$types';
import { getCurrentContext, listContextSessions } from '$lib/api/persona-context';
import { listPersonas } from '$lib/api/personas';
import { error } from '@sveltejs/kit';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		const [context, sessionsResult, personasResult] = await Promise.all([
			getCurrentContext(locals.accessToken, locals.tenantId, fetch),
			listContextSessions({ limit: 50 }, locals.accessToken, locals.tenantId, fetch),
			listPersonas({ limit: 100 }, locals.accessToken, locals.tenantId, fetch)
		]);

		return {
			context,
			sessions: sessionsResult.items,
			sessionsTotal: sessionsResult.total,
			personas: personasResult.items ?? []
		};
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load persona context');
	}
};
