import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listApprovalGroups, createApprovalGroup } from '$lib/api/approval-workflows';
import type { CreateApprovalGroupRequest } from '$lib/api/types';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const is_active =
		url.searchParams.get('is_active') === 'true'
			? true
			: url.searchParams.get('is_active') === 'false'
				? false
				: undefined;

	const result = await listApprovalGroups(
		{ is_active, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
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
	if (typeof body.name !== 'string' || body.name.length === 0) {
		error(400, 'name is required');
	}
	const data: CreateApprovalGroupRequest = { name: body.name };
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	if (body.member_ids !== undefined) {
		if (
			!Array.isArray(body.member_ids) ||
			body.member_ids.some((id) => typeof id !== 'string')
		) {
			error(400, 'member_ids must be an array of strings');
		}
		data.member_ids = body.member_ids as string[];
	}
	const result = await createApprovalGroup(data, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
