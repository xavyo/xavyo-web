import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRiskFactors, createRiskFactor } from '$lib/api/risk';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const category = url.searchParams.get('category') ?? undefined;
	const is_enabled = url.searchParams.get('is_enabled') === 'true' ? true : url.searchParams.get('is_enabled') === 'false' ? false : undefined;
	const factor_type = url.searchParams.get('factor_type') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	try {
		const result = await listRiskFactors(
			{ category, is_enabled, factor_type, limit, offset },
			locals.accessToken, locals.tenantId, fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Internal error');
	}
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		const body = await request.json();
		const result = await createRiskFactor(body, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Internal error');
	}
};
