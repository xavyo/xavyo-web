import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listBirthrightPolicies, createBirthrightPolicy } from '$lib/api/birthright';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const offset = Number(url.searchParams.get('offset') ?? '0');
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const status = url.searchParams.get('status') ?? undefined;

	const result = await listBirthrightPolicies(
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

	const body = await request.json();
	const result = await createBirthrightPolicy(body, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
