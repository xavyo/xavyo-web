import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listUserRiskEvents } from '$lib/api/risk';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const event_type = url.searchParams.get('event_type') ?? undefined;
	const factor_id = url.searchParams.get('factor_id') ?? undefined;
	const include_expired = url.searchParams.get('include_expired') === 'true' ? true : undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	try {
		const result = await listUserRiskEvents(
			params.userId,
			{ event_type, factor_id, include_expired, limit, offset },
			locals.accessToken, locals.tenantId, fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Internal error');
	}
};
