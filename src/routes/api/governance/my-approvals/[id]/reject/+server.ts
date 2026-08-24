import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { rejectApproval } from '$lib/api/my-approvals';
import type { RejectApprovalRequest } from '$lib/api/types';

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
	if (typeof body.comment !== 'string' || body.comment.length === 0) {
		error(400, 'comment is required');
	}
	const data: RejectApprovalRequest = { comment: body.comment };
	const result = await rejectApproval(params.id, data, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
