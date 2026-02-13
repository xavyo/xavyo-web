import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCorrelationAuditEvent } from '$lib/api/correlation';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await getCorrelationAuditEvent(params.eventId, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
