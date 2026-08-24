import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { reviewExcessivePrivilege } from '$lib/api/role-mining';
import type { PrivilegeReviewAction, ReviewExcessivePrivilegeRequest } from '$lib/api/types';

const ACTIONS = ['accept', 'remediate'] as const;

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
	if (!ACTIONS.includes(body.action as (typeof ACTIONS)[number])) {
		error(400, 'action is required');
	}
	const data: ReviewExcessivePrivilegeRequest = {
		action: body.action as PrivilegeReviewAction
	};
	if (body.notes !== undefined) {
		if (typeof body.notes !== 'string') {
			error(400, 'notes must be a string');
		}
		data.notes = body.notes;
	}
	const result = await reviewExcessivePrivilege(
		params.flagId,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
