import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getRoleParameter,
	updateRoleParameter,
	deleteRoleParameter
} from '$lib/api/governance-roles';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getRoleParameter(
		params.id,
		params.pid,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const result = await updateRoleParameter(
		params.id,
		params.pid,
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

	await deleteRoleParameter(
		params.id,
		params.pid,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return new Response(null, { status: 204 });
};
