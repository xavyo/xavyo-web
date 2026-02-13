import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { listSiemDestinations, createSiemDestination } from '$lib/api/siem';
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
		const enabled = url.searchParams.get('enabled');
		const destination_type = url.searchParams.get('destination_type');
		const limit = url.searchParams.get('limit');
		const offset = url.searchParams.get('offset');

		if (enabled) params.enabled = enabled === 'true';
		if (destination_type) params.destination_type = destination_type;
		if (limit) params.limit = Number(limit);
		if (offset) params.offset = Number(offset);

		const result = await listSiemDestinations(params, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to list SIEM destinations' }, { status: 500 });
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
		const result = await createSiemDestination(body, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to create SIEM destination' }, { status: 500 });
	}
};
