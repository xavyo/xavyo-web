import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { removeEscalationLevel } from '$lib/api/approval-workflows';

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await removeEscalationLevel(
		params.id,
		params.levelId,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return new Response(null, { status: 204 });
};
