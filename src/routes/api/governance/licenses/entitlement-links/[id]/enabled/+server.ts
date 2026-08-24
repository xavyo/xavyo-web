import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { toggleLicenseEntitlementLink } from '$lib/api/licenses';
import { ApiError } from '$lib/api/client';

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	let parsed: unknown;
	try {
		parsed = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}
	const body = parsed as Record<string, unknown>;
	if (typeof body.enabled !== 'boolean') {
		return json({ error: 'enabled is required' }, { status: 400 });
	}
	try {
		const result = await toggleLicenseEntitlementLink(
			params.id,
			body.enabled,
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to toggle license entitlement link' }, { status: 500 });
	}
};
