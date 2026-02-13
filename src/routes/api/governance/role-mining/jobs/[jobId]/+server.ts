import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getMiningJob, deleteMiningJob } from '$lib/api/role-mining';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getMiningJob(params.jobId, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await deleteMiningJob(params.jobId, locals.accessToken, locals.tenantId, fetch);

	return new Response(null, { status: 204 });
};
