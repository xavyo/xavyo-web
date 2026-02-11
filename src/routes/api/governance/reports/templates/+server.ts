import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listTemplates, createTemplate } from '$lib/api/governance-reporting';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	try {
		const result = await listTemplates(
			{
				template_type: url.searchParams.get('template_type') ?? undefined,
				compliance_standard: url.searchParams.get('compliance_standard') ?? undefined,
				include_system: url.searchParams.get('include_system') === 'false' ? false : undefined,
				limit: Number(url.searchParams.get('limit') ?? '50'),
				offset: Number(url.searchParams.get('offset') ?? '0')
			},
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

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	try {
		const body = await request.json();
		const result = await createTemplate(body, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
