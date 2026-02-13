import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exportSimulationComparison } from '$lib/api/simulations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	try {
		const format = url.searchParams.get('format') ?? 'json';
		const res = await exportSimulationComparison(params.id, format, locals.accessToken, locals.tenantId, fetch);
		return new Response(res.body, {
			status: res.status,
			headers: {
				'Content-Type': res.headers.get('Content-Type') ?? 'application/octet-stream',
				'Content-Disposition': res.headers.get('Content-Disposition') ?? `attachment; filename="comparison-${params.id}.${format}"`
			}
		});
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
