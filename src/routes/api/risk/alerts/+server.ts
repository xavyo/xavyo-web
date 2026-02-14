import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRiskAlerts } from '$lib/api/risk';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const user_id = url.searchParams.get('user_id') ?? undefined;
	const severity = url.searchParams.get('severity') ?? undefined;
	const acknowledged = url.searchParams.get('acknowledged') === 'true' ? true : url.searchParams.get('acknowledged') === 'false' ? false : undefined;
	const sort_by = url.searchParams.get('sort_by') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	try {
		const result = await listRiskAlerts(
			{ user_id, severity, acknowledged, sort_by, limit, offset },
			locals.accessToken, locals.tenantId, fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Internal error');
	}
};
