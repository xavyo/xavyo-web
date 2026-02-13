import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listDetectionRules, createDetectionRule } from '$lib/api/detection-rules';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const rule_type = url.searchParams.get('rule_type') ?? undefined;
	const is_enabled = url.searchParams.get('is_enabled') === 'true' ? true : url.searchParams.get('is_enabled') === 'false' ? false : undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listDetectionRules(
		{ rule_type, is_enabled, limit, offset },
		locals.accessToken, locals.tenantId, fetch
	);
	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const body = await request.json();
	const result = await createDetectionRule(body, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
