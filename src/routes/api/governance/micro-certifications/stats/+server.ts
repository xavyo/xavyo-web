import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getMicroCertificationStats } from '$lib/api/micro-certifications';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const result = await getMicroCertificationStats(locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
