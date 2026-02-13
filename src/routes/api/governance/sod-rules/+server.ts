import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listSodRules, createSodRule } from '$lib/api/governance';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const offset = Number(url.searchParams.get('offset') ?? '0');
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const status = url.searchParams.get('status') ?? undefined;
	const severity = url.searchParams.get('severity') ?? undefined;
	const entitlement_id = url.searchParams.get('entitlement_id') ?? undefined;

	const result = await listSodRules(
		{ status, severity, entitlement_id, limit, offset },
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

	const body = await request.json();
	const result = await createSodRule(body, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
