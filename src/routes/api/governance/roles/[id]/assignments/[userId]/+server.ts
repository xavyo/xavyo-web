import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { assignRole, revokeRole, checkUserHasRole } from '$lib/api/governance-roles';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	const result = await assignRole(
		params.id,
		params.userId,
		{
			justification: typeof body.justification === 'string' ? body.justification : undefined,
			expires_at: typeof body.expires_at === 'string' ? body.expires_at : undefined
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result, { status: 201 });
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await revokeRole(
		params.id,
		params.userId,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await checkUserHasRole(
		params.id,
		params.userId,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
