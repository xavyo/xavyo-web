import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listAccessRequests, createAccessRequest } from '$lib/api/access-requests';
import type { CreateAccessRequestRequest } from '$lib/api/types';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const status = url.searchParams.get('status') ?? undefined;
	const entitlement_id = url.searchParams.get('entitlement_id') ?? undefined;
	const has_sod_warning =
		url.searchParams.get('has_sod_warning') === 'true'
			? true
			: url.searchParams.get('has_sod_warning') === 'false'
				? false
				: undefined;

	const result = await listAccessRequests(
		{ status, entitlement_id, has_sod_warning, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

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
	if (typeof body.entitlement_id !== 'string' || body.entitlement_id.length === 0) {
		error(400, 'entitlement_id is required');
	}
	if (typeof body.justification !== 'string' || body.justification.length === 0) {
		error(400, 'justification is required');
	}
	const data: CreateAccessRequestRequest = {
		entitlement_id: body.entitlement_id,
		justification: body.justification
	};
	if (body.requested_expires_at !== undefined) {
		if (typeof body.requested_expires_at !== 'string') {
			error(400, 'requested_expires_at must be a string');
		}
		data.requested_expires_at = body.requested_expires_at;
	}
	const result = await createAccessRequest(data, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
