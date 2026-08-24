import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listPolicies, createPolicy } from '$lib/api/authorization';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const offset = Number(url.searchParams.get('offset') ?? '0');
	const limit = Number(url.searchParams.get('limit') ?? '20');

	const result = await listPolicies(
		{ limit, offset },
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
	if (body.effect !== 'allow' && body.effect !== 'deny') {
		error(400, 'effect is required');
	}
	const result = await createPolicy(
		{
			name: body.name,
			effect: body.effect,
			description: typeof body.description === 'string' ? body.description : undefined,
			priority: typeof body.priority === 'number' ? body.priority : undefined,
			resource_type: typeof body.resource_type === 'string' ? body.resource_type : undefined,
			action: typeof body.action === 'string' ? body.action : undefined
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result, { status: 201 });
};
