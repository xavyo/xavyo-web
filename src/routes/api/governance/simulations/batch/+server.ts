import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listBatchSimulations, createBatchSimulation } from '$lib/api/simulations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	try {
		const batch_type = url.searchParams.get('batch_type') || undefined;
		const status = url.searchParams.get('status') || undefined;
		const created_by = url.searchParams.get('created_by') || undefined;
		const include_archived = url.searchParams.get('include_archived') === 'true' ? true : undefined;
		const offset = Number(url.searchParams.get('offset') ?? '0');
		const limit = Number(url.searchParams.get('limit') ?? '20');
		const result = await listBatchSimulations(
			{ batch_type, status, created_by, include_archived, offset, limit },
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	try {
		const body = await request.json();
		const result = await createBatchSimulation(body, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
