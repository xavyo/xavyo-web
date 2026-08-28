import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listApplications, createApplication } from '$lib/api/governance';
import type { AppType, CreateApplicationRequest } from '$lib/api/types';
import { listPagination } from '$lib/server/list-pagination';

const APP_TYPES = ['internal', 'external'] as const;

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const status = url.searchParams.get('status') ?? undefined;
	const app_type = url.searchParams.get('app_type') ?? undefined;

	const result = await listApplications(
		{ status, app_type, ...listPagination(url) },
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
	if (typeof body.name !== 'string' || body.name.length === 0) {
		error(400, 'name is required');
	}
	if (!APP_TYPES.includes(body.app_type as (typeof APP_TYPES)[number])) {
		error(400, 'app_type is required');
	}
	const data: CreateApplicationRequest = {
		name: body.name,
		app_type: body.app_type as AppType
	};
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
	const result = await createApplication(data, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
