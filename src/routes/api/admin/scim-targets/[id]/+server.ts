import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getScimTarget, updateScimTarget, deleteScimTarget } from '$lib/api/scim-targets';
import { ApiError } from '$lib/api/client';
import type { UpdateScimTargetRequest } from '$lib/api/types';
import { applyScimTargetAdvertisedFields } from '$lib/server/scim-target-fields';
import { JsonObjectError } from '$lib/utils/json-record';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const result = await getScimTarget(params.id, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to fetch SCIM target' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		let parsed: unknown;
		try {
			parsed = await request.json();
		} catch {
			return json({ error: 'Invalid JSON body' }, { status: 400 });
		}
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			return json({ error: 'Invalid JSON body' }, { status: 400 });
		}
		const body = parsed as Record<string, unknown>;
		const data: UpdateScimTargetRequest = {};
		if (body.name !== undefined) {
			if (typeof body.name !== 'string' || body.name.length === 0) {
				return json({ error: 'name must be a non-empty string' }, { status: 400 });
			}
			data.name = body.name;
		}
		if (body.base_url !== undefined) {
			if (typeof body.base_url !== 'string' || body.base_url.length === 0) {
				return json({ error: 'base_url must be a non-empty string' }, { status: 400 });
			}
			data.base_url = body.base_url;
		}
		if (body.auth_method !== undefined) {
			if (body.auth_method !== 'bearer' && body.auth_method !== 'oauth2') {
				return json({ error: 'auth_method must be bearer or oauth2' }, { status: 400 });
			}
			data.auth_method = body.auth_method;
		}
		if (body.credentials !== undefined) {
			if (!body.credentials || typeof body.credentials !== 'object' || Array.isArray(body.credentials)) {
				return json({ error: 'credentials must be an object' }, { status: 400 });
			}
			data.credentials = body.credentials as UpdateScimTargetRequest['credentials'];
		}
		try {
			applyScimTargetAdvertisedFields(body, data);
		} catch (e) {
			if (e instanceof JsonObjectError) {
				return json({ error: e.message }, { status: 400 });
			}
			throw e;
		}
		const result = await updateScimTarget(params.id, data, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to update SCIM target' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		await deleteScimTarget(params.id, locals.accessToken, locals.tenantId, fetch);
		return new Response(null, { status: 204 });
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to delete SCIM target' }, { status: 500 });
	}
};
