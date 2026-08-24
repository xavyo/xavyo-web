import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listSodExemptions, createSodExemption } from '$lib/api/approval-workflows';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const offset = Number(url.searchParams.get('offset') ?? '0');
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const status = url.searchParams.get('status') ?? undefined;

	const result = await listSodExemptions(
		{ status, limit, offset },
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
	if (typeof body.rule_id !== 'string' || body.rule_id.length === 0) {
		error(400, 'rule_id is required');
	}
	if (typeof body.user_id !== 'string' || body.user_id.length === 0) {
		error(400, 'user_id is required');
	}
	if (typeof body.justification !== 'string' || body.justification.length === 0) {
		error(400, 'justification is required');
	}
	if (typeof body.expires_at !== 'string' || body.expires_at.length === 0) {
		error(400, 'expires_at is required');
	}
	const result = await createSodExemption(
		{
			rule_id: body.rule_id,
			user_id: body.user_id,
			justification: body.justification,
			expires_at: body.expires_at
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result, { status: 201 });
};
