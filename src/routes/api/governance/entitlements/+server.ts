import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listEntitlements, createEntitlement } from '$lib/api/governance';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const offset = Number(url.searchParams.get('offset') ?? '0');
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const status = url.searchParams.get('status') ?? undefined;
	const risk_level = url.searchParams.get('risk_level') ?? undefined;
	const classification = url.searchParams.get('classification') ?? undefined;

	const result = await listEntitlements(
		{ status, risk_level, classification, limit, offset },
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
	const result = await createEntitlement(body, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
