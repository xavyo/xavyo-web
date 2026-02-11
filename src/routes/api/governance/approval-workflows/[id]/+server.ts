import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getApprovalWorkflow,
	updateApprovalWorkflow,
	deleteApprovalWorkflow
} from '$lib/api/approval-workflows';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getApprovalWorkflow(params.id, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const result = await updateApprovalWorkflow(
		params.id,
		body,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await deleteApprovalWorkflow(params.id, locals.accessToken, locals.tenantId, fetch);

	return new Response(null, { status: 204 });
};
