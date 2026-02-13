import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listTriggerRules, createTriggerRule } from '$lib/api/micro-certifications';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Admin access required');

	const trigger_type = url.searchParams.get('trigger_type') ?? undefined;
	const scope_type = url.searchParams.get('scope_type') ?? undefined;
	const is_active =
		url.searchParams.get('is_active') !== null
			? url.searchParams.get('is_active') === 'true'
			: undefined;
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listTriggerRules(
		{ trigger_type, scope_type, is_active, limit, offset },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Admin access required');

	const body = await request.json();
	try {
		const result = await createTriggerRule(body, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e: any) {
		const msg = e?.message || e?.body?.message || String(e);
		const status = e?.status || 500;
		return json({ error: msg, detail: e?.body }, { status });
	}
};
