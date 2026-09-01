import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listSecrets, storeSecret } from '$lib/api/nhi-vault';
import { ApiError } from '$lib/api/client';
import type { StoreSecretRequest } from '$lib/api/types';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
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
	try {
		if (body.rotation_interval_days !== undefined) {
			data.rotation_interval_days = parseBoundedInteger(
				body.rotation_interval_days,
				1,
				3650,
				'rotation_interval_days'
			);
		}
		if (body.max_lease_duration_secs !== undefined) {
			data.max_lease_duration_secs = parseBoundedInteger(
				body.max_lease_duration_secs,
				1,
				31_536_000,
				'max_lease_duration_secs'
			);
		}
		if (body.max_concurrent_leases !== undefined) {
			data.max_concurrent_leases = parseBoundedInteger(
				body.max_concurrent_leases,
				1,
				10_000,
				'max_concurrent_leases'
			);
		}
	} catch (e) {
		if (e instanceof JsonObjectError) error(400, e.message);
		throw e;
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
