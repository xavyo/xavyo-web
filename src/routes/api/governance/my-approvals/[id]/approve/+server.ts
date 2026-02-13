import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { approveApproval } from '$lib/api/my-approvals';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const result = await approveApproval(
		params.id,
		body,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
