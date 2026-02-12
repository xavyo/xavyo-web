import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ignoreDiscrepancy } from '$lib/api/reconciliation';

export const POST: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await ignoreDiscrepancy(
		params.id,
		params.discrepancyId,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return new Response(null, { status: 204 });
};
