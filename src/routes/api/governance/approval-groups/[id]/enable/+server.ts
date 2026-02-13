import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { enableApprovalGroup } from '$lib/api/approval-workflows';

export const POST: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await enableApprovalGroup(params.id, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
