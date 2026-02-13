import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listApprovalWorkflows, createApprovalWorkflow } from '$lib/api/approval-workflows';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const offset = Number(url.searchParams.get('offset') ?? '0');
	const limit = Number(url.searchParams.get('limit') ?? '20');

	try {
		const result = await listApprovalWorkflows(
			{ limit, offset },
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ message: e.message }, { status: e.status });
		}
		throw e;
	}
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();

	try {
		const result = await createApprovalWorkflow(body, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ message: e.message }, { status: e.status });
		}
		throw e;
	}
};
