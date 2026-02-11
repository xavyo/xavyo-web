import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { removeGroupMembers } from '$lib/api/approval-workflows';

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await removeGroupMembers(
		params.id,
		{ member_ids: [params.userId] },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
