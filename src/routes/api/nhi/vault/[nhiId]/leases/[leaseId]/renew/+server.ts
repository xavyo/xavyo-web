import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { renewLease } from '$lib/api/nhi-vault';
import { ApiError } from '$lib/api/client';
import type { RenewLeaseRequest } from '$lib/api/types';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';

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
	let extend_secs: number;
	try {
		extend_secs = parseBoundedInteger(body.extend_secs, 1, 31_536_000, 'extend_secs');
	} catch (e) {
		if (e instanceof JsonObjectError) error(400, e.message);
		throw e;
	}
	const data: RenewLeaseRequest = { extend_secs };

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
