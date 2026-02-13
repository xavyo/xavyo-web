import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { cancelRun } from '$lib/api/reconciliation';

export const POST: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await cancelRun(params.id, params.runId, locals.accessToken, locals.tenantId, fetch);

	return new Response(null, { status: 204 });
};
