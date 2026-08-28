import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createBulkStateOperation, listBulkStateOperations } from '$lib/api/governance-operations';
import type { CreateBulkStateOperationRequest } from '$lib/api/types';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		const result = await listBulkStateOperations(
			{
				status: url.searchParams.get('status') ?? undefined,
				transition_id: url.searchParams.get('transition_id') ?? undefined,
				...listPagination(url)
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

	try {
		let parsed: unknown;
		try {
			parsed = await request.json();
		} catch {
			error(400, 'Invalid JSON body');
		}
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			error(400, 'Invalid JSON body');
		}
		const body = parsed as Record<string, unknown>;
		if (typeof body.transition_id !== 'string' || body.transition_id.length === 0) {
			error(400, 'transition_id is required');
		}
		if (
			!Array.isArray(body.object_ids) ||
			body.object_ids.length === 0 ||
			body.object_ids.some((id) => typeof id !== 'string' || id.length === 0)
		) {
			error(400, 'object_ids is required');
		}
		const data: CreateBulkStateOperationRequest = {
			transition_id: body.transition_id,
			object_ids: body.object_ids as string[]
		};
		const result = await createBulkStateOperation(data, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
