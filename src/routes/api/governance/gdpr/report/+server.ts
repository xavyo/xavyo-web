import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getGdprReport } from '$lib/api/gdpr';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const result = await getGdprReport(locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
