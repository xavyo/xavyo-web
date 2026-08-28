import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { renewLease } from '$lib/api/nhi-vault';
import { ApiError } from '$lib/api/client';
import type { RenewLeaseRequest } from '$lib/api/types';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	if (typeof body.extend_secs !== 'number') {
		error(400, 'extend_secs is required');
	}
	const data: RenewLeaseRequest = { extend_secs: body.extend_secs };

	try {
		const result = await renewLease(
			params.nhiId,
			params.leaseId,
			data,
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
