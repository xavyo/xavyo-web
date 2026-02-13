import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRoles, createRole } from '$lib/api/governance-roles';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const offset = Number(url.searchParams.get('offset') ?? '0');
	const limit = Number(url.searchParams.get('limit') ?? '50');

	const result = await listRoles(
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

	const body = await request.json();
	const result = await createRole(body, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
