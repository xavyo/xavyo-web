import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { approveApproval } from '$lib/api/my-approvals';
import type { ApproveApprovalRequest } from '$lib/api/types';

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
	const data: ApproveApprovalRequest = {};
	if (body.comment !== undefined) {
		if (typeof body.comment !== 'string') {
			error(400, 'comment must be a string');
		}
		data.comment = body.comment;
	}
	const result = await approveApproval(params.id, data, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
