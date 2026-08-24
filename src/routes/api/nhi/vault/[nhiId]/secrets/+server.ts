import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listSecrets, storeSecret } from '$lib/api/nhi-vault';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { StoreSecretRequest } from '$lib/api/types';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Admin role required');
	}
	try {
		const result = await listSecrets(params.nhiId, locals.accessToken, locals.tenantId, fetch);
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
	if (typeof body.name !== 'string' || body.name.length === 0) {
		error(400, 'name is required');
	}
	if (typeof body.value !== 'string' || body.value.length === 0) {
		error(400, 'value is required');
	}
	const data: StoreSecretRequest = { name: body.name, value: body.value };
	if (body.secret_type !== undefined) {
		if (typeof body.secret_type !== 'string') {
			error(400, 'secret_type must be a string');
		}
		data.secret_type = body.secret_type;
	}
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	if (body.inject_as !== undefined) {
		if (typeof body.inject_as !== 'string') {
			error(400, 'inject_as must be a string');
		}
		data.inject_as = body.inject_as;
	}
	if (body.inject_format !== undefined) {
		if (typeof body.inject_format !== 'string') {
			error(400, 'inject_format must be a string');
		}
		data.inject_format = body.inject_format;
	}
	if (body.expires_at !== undefined) {
		if (typeof body.expires_at !== 'string') {
			error(400, 'expires_at must be a string');
		}
		data.expires_at = body.expires_at;
	}
	if (body.rotation_interval_days !== undefined) {
		if (typeof body.rotation_interval_days !== 'number') {
			error(400, 'rotation_interval_days must be a number');
		}
		data.rotation_interval_days = body.rotation_interval_days;
	}
	if (body.max_lease_duration_secs !== undefined) {
		if (typeof body.max_lease_duration_secs !== 'number') {
			error(400, 'max_lease_duration_secs must be a number');
		}
		data.max_lease_duration_secs = body.max_lease_duration_secs;
	}
	if (body.max_concurrent_leases !== undefined) {
		if (typeof body.max_concurrent_leases !== 'number') {
			error(400, 'max_concurrent_leases must be a number');
		}
		data.max_concurrent_leases = body.max_concurrent_leases;
	}

	try {
		const result = await storeSecret(
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
