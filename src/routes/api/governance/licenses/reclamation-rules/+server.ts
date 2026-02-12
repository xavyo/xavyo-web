import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { listReclamationRules, createReclamationRule } from '$lib/api/licenses';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	try {
		const params: Record<string, string | number | boolean> = {};
		const license_pool_id = url.searchParams.get('license_pool_id');
		const trigger_type = url.searchParams.get('trigger_type');
		const enabled = url.searchParams.get('enabled');
		const limit = url.searchParams.get('limit');
		const offset = url.searchParams.get('offset');

		if (license_pool_id) params.license_pool_id = license_pool_id;
		if (trigger_type) params.trigger_type = trigger_type;
		if (enabled) params.enabled = enabled === 'true';
		if (limit) params.limit = Number(limit);
		if (offset) params.offset = Number(offset);

		const result = await listReclamationRules(params, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to list reclamation rules' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	try {
		const body = await request.json();
		const result = await createReclamationRule(body, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to create reclamation rule' }, { status: 500 });
	}
};
