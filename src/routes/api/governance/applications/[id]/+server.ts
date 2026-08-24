import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getApplication, updateApplication, deleteApplication } from '$lib/api/governance';
import type { AppStatus, UpdateApplicationRequest } from '$lib/api/types';

const APP_STATUSES = ['active', 'inactive'] as const;

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getApplication(params.id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	const data: UpdateApplicationRequest = {};
	if (body.name !== undefined) {
		if (typeof body.name !== 'string' || body.name.length === 0) {
			error(400, 'name must be a non-empty string');
		}
		data.name = body.name;
	}
	if (body.status !== undefined) {
		if (!APP_STATUSES.includes(body.status as (typeof APP_STATUSES)[number])) {
			error(400, 'status is required');
		}
		data.status = body.status as AppStatus;
	}
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	if (body.owner_id !== undefined) {
		if (typeof body.owner_id !== 'string') {
			error(400, 'owner_id must be a string');
		}
		data.owner_id = body.owner_id;
	}
	if (body.external_id !== undefined) {
		if (typeof body.external_id !== 'string') {
			error(400, 'external_id must be a string');
		}
		data.external_id = body.external_id;
	}
	if (body.is_delegable !== undefined) {
		if (typeof body.is_delegable !== 'boolean') {
			error(400, 'is_delegable must be a boolean');
		}
		data.is_delegable = body.is_delegable;
	}
	if (body.metadata !== undefined) {
		if (!body.metadata || typeof body.metadata !== 'object' || Array.isArray(body.metadata)) {
			error(400, 'metadata must be an object');
		}
		data.metadata = body.metadata as Record<string, unknown>;
	}
	const result = await updateApplication(
		params.id,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await deleteApplication(params.id, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
