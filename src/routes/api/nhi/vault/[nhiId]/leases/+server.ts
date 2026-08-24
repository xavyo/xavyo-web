import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listLeases, createLease } from '$lib/api/nhi-vault';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { CreateLeaseRequest } from '$lib/api/types';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Admin role required');
	}
	try {
		const result = await listLeases(params.nhiId, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Admin role required');
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
	if (typeof body.secret_id !== 'string' || body.secret_id.length === 0) {
		error(400, 'secret_id is required');
	}
	if (typeof body.lessee_nhi_id !== 'string' || body.lessee_nhi_id.length === 0) {
		error(400, 'lessee_nhi_id is required');
	}
	const data: CreateLeaseRequest = {
		secret_id: body.secret_id,
		lessee_nhi_id: body.lessee_nhi_id
	};
	if (body.lessee_type !== undefined) {
		if (typeof body.lessee_type !== 'string') {
			error(400, 'lessee_type must be a string');
		}
		data.lessee_type = body.lessee_type;
	}
	if (body.duration_secs !== undefined) {
		if (typeof body.duration_secs !== 'number') {
			error(400, 'duration_secs must be a number');
		}
		data.duration_secs = body.duration_secs;
	}

	try {
		const result = await createLease(
			params.nhiId,
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
