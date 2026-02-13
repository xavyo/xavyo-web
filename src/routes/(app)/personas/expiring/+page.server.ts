import type { PageServerLoad } from './$types';
import { listExpiringPersonas } from '$lib/api/persona-expiry';
import { hasAdminRole } from '$lib/server/auth';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) throw error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) throw error(403, 'Forbidden');

	try {
		const result = await listExpiringPersonas({ days_ahead: 30, limit: 50 }, locals.accessToken, locals.tenantId, fetch);
		return { personas: Array.isArray(result?.items) ? result.items : Array.isArray(result) ? result : [], total: result?.total ?? 0 };
	} catch {
		return { personas: [], total: 0 };
	}
};
