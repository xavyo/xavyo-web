import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { cloneTemplate } from '$lib/api/governance-reporting';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	try {
		const body = await request.json();
		const result = await cloneTemplate(params.id, body, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
