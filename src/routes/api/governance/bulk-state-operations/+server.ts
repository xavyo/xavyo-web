import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createBulkStateOperation, listBulkStateOperations } from '$lib/api/governance-operations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	try {
		const result = await listBulkStateOperations(
			{
				status: url.searchParams.get('status') ?? undefined,
				transition_id: url.searchParams.get('transition_id') ?? undefined,
				limit: url.searchParams.has('limit') ? Number(url.searchParams.get('limit')) : undefined,
				offset: url.searchParams.has('offset') ? Number(url.searchParams.get('offset')) : undefined
			},
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
		const result = await createBulkStateOperation(body, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
