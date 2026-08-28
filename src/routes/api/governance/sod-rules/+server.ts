import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listSodRules, createSodRule } from '$lib/api/governance';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const status = url.searchParams.get('status') ?? undefined;
	const severity = url.searchParams.get('severity') ?? undefined;
	const entitlement_id = url.searchParams.get('entitlement_id') ?? undefined;

	const result = await listSodRules(
		{ status, severity, entitlement_id, ...listPagination(url) },
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
	if (typeof body.name !== 'string' || body.name.length === 0) {
		error(400, 'name is required');
	}
	if (typeof body.first_entitlement_id !== 'string' || body.first_entitlement_id.length === 0) {
		error(400, 'first_entitlement_id is required');
	}
	if (typeof body.second_entitlement_id !== 'string' || body.second_entitlement_id.length === 0) {
		error(400, 'second_entitlement_id is required');
	}
	if (
		body.severity !== 'low' &&
		body.severity !== 'medium' &&
		body.severity !== 'high' &&
		body.severity !== 'critical'
	) {
		error(400, 'severity is required');
	}
	const result = await createSodRule(
		{
			name: body.name,
			first_entitlement_id: body.first_entitlement_id,
			second_entitlement_id: body.second_entitlement_id,
			severity: body.severity,
			description: typeof body.description === 'string' ? body.description : undefined
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result, { status: 201 });
};
