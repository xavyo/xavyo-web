import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listApplications } from '$lib/api/governance';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const offset = Number(url.searchParams.get('offset') ?? '0');
	const limit = Number(url.searchParams.get('limit') ?? '100');
	const status = url.searchParams.get('status') ?? undefined;
	const app_type = url.searchParams.get('app_type') ?? undefined;

	const result = await listApplications(
		{ status, app_type, limit, offset },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
