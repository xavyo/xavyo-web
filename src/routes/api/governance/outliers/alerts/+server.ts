import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listOutlierAlerts } from '$lib/api/outliers';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const user_id = url.searchParams.get('user_id') ?? undefined;
	const analysis_id = url.searchParams.get('analysis_id') ?? undefined;
	const alert_type = url.searchParams.get('alert_type') ?? undefined;
	const severity = url.searchParams.get('severity') ?? undefined;
	const is_read = url.searchParams.get('is_read') !== null ? url.searchParams.get('is_read') === 'true' : undefined;
	const is_dismissed = url.searchParams.get('is_dismissed') !== null ? url.searchParams.get('is_dismissed') === 'true' : undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');
	const result = await listOutlierAlerts({ user_id, analysis_id, alert_type, severity, is_read, is_dismissed, limit, offset }, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
