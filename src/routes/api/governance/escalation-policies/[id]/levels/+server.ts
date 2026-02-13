import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addEscalationLevel } from '$lib/api/approval-workflows';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const result = await addEscalationLevel(
		params.id,
		body,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result, { status: 201 });
};
