import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { triggerCorrelation } from '$lib/api/correlation';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
	const text = await request.text();
	let body: Record<string, unknown> | undefined;
	if (text.trim()) {
		let parsed: unknown;
		try {
			parsed = JSON.parse(text);
		} catch {
			error(400, 'Invalid JSON body');
		}
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			error(400, 'Invalid JSON body');
		}
		body = parsed as Record<string, unknown>;
	}
	const result = await triggerCorrelation(
		params.connectorId,
		body as { account_ids?: string[] } | undefined,
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result, { status: 202 });
};
