import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getEscalationHistory } from '$lib/api/approval-workflows';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getEscalationHistory(
		params.id,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
