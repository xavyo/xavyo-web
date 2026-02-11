import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listPersonas } from '$lib/api/personas';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const offset = Number(url.searchParams.get('offset') ?? '0');
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const status = url.searchParams.get('status') ?? undefined;
	const archetype_id = url.searchParams.get('archetype_id') ?? undefined;

	const result = await listPersonas(
		{ offset, limit, status, archetype_id },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
