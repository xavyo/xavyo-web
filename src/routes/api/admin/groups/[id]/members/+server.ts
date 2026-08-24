import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addGroupMembers } from '$lib/api/groups';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	let parsed: unknown;
	try {
		parsed = await request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		error(400, 'Invalid JSON body');
	}
	const body = parsed as Record<string, unknown>;
	if (!Array.isArray(body.member_ids) || body.member_ids.length === 0) {
		error(400, 'member_ids is required');
	}
	const result = await addGroupMembers(
		params.id,
		{ member_ids: body.member_ids as string[] },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
