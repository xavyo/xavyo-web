import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { listCorrelationRules, createCorrelationRule } from '$lib/api/correlation';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const match_type = url.searchParams.get('match_type') ?? undefined;
	const is_active = url.searchParams.has('is_active') ? url.searchParams.get('is_active') === 'true' : undefined;
	const tier = url.searchParams.has('tier') ? Number(url.searchParams.get('tier')) : undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listCorrelationRules(
		params.connectorId, { match_type, is_active, tier, limit, offset },
		locals.accessToken, locals.tenantId, fetch
	);
	return json(result);
};

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	const body = await request.json();
	const result = await createCorrelationRule(params.connectorId, body, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
