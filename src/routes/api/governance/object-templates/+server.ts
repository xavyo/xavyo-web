import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { listObjectTemplates, createObjectTemplate } from '$lib/api/object-templates';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	const params = {
		object_type: url.searchParams.get('object_type') ?? undefined,
		status: url.searchParams.get('status') ?? undefined,
		name: url.searchParams.get('name') ?? undefined,
		offset: Number(url.searchParams.get('offset') ?? '0'),
		limit: Number(url.searchParams.get('limit') ?? '20')
	};

	try {
		const result = await listObjectTemplates(params, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	const body = await request.json();
	try {
		const result = await createObjectTemplate(body, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
