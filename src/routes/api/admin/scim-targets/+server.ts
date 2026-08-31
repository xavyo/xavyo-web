import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listScimTargets, createScimTarget } from '$lib/api/scim-targets';
import { ApiError } from '$lib/api/client';
import type { CreateScimTargetRequest } from '$lib/api/types';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const status = url.searchParams.get('status') ?? undefined;

	try {
		const result = await listScimTargets(
			{ status, ...listPagination(url) },
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to fetch SCIM targets' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
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
		if (typeof body.name !== 'string' || body.name.length === 0) {
			return json({ error: 'name is required' }, { status: 400 });
		}
		if (typeof body.base_url !== 'string' || body.base_url.length === 0) {
			return json({ error: 'base_url is required' }, { status: 400 });
		}
		if (body.auth_method !== 'bearer' && body.auth_method !== 'oauth2') {
			return json({ error: 'auth_method is required' }, { status: 400 });
		}
		if (!body.credentials || typeof body.credentials !== 'object' || Array.isArray(body.credentials)) {
			return json({ error: 'credentials is required' }, { status: 400 });
		}
		const result = await createScimTarget(
			{
				name: body.name,
				base_url: body.base_url,
				auth_method: body.auth_method,
				credentials: body.credentials as CreateScimTargetRequest['credentials']
			},
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to create SCIM target' }, { status: 500 });
	}
};
