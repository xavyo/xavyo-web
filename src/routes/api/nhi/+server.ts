import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listNhi } from '$lib/api/nhi';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const offset = Number(url.searchParams.get('offset') ?? '0');
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const nhi_type = url.searchParams.get('nhi_type') ?? undefined;
	const lifecycle_state = url.searchParams.get('lifecycle_state') ?? undefined;

	const result = await listNhi(
		{ offset, limit, nhi_type, lifecycle_state },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
