import type { Actions, PageServerLoad } from './$types';
import { redirect, isRedirect } from '@sveltejs/kit';
import { getLifecycleEvent, processLifecycleEvent } from '$lib/api/birthright';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) redirect(302, '/dashboard');

	// Backend returns flattened response: event fields at top level + actions + snapshot
	const detail = await getLifecycleEvent(params.id, locals.accessToken!, locals.tenantId!, fetch);

	// Normalize to component-friendly shape
	const event = {
		id: detail.id,
		tenant_id: detail.tenant_id,
		user_id: detail.user_id,
		event_type: detail.event_type,
		attributes_before: detail.attributes_before,
		attributes_after: detail.attributes_after,
		source: detail.source,
		processed_at: detail.processed_at,
		created_at: detail.created_at
	};

	return {
		event,
		actions: detail.actions ?? [],
		snapshot: detail.snapshot ?? null
	};
};

export const actions: Actions = {
	process: async ({ params, locals, fetch }) => {
		try {
			const result = await processLifecycleEvent(params.id, locals.accessToken!, locals.tenantId!, fetch);
			return { success: true, summary: result.summary };
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) return { error: e.message };
			return { error: 'Failed to process event' };
		}
	}
};
