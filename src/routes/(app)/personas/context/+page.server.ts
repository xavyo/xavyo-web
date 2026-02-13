import type { PageServerLoad } from './$types';
import { getCurrentContext, listContextSessions } from '$lib/api/persona-context';
import { listPersonas } from '$lib/api/personas';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		return { context: null, sessions: [], personas: [] };
	}

	try {
		const [context, sessionsResult, personasResult] = await Promise.all([
			getCurrentContext(locals.accessToken, locals.tenantId, fetch).catch(() => null),
			listContextSessions({ limit: 50 }, locals.accessToken, locals.tenantId, fetch).catch(() => ({ items: [], total: 0 })),
			listPersonas({ limit: 100 }, locals.accessToken, locals.tenantId, fetch).catch(() => ({ items: [] }))
		]);

		return {
			context,
			sessions: sessionsResult.items,
			sessionsTotal: sessionsResult.total,
			personas: personasResult.items ?? []
		};
	} catch {
		return { context: null, sessions: [], sessionsTotal: 0, personas: [] };
	}
};
