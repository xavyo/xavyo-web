import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getProvisioningScript,
	updateProvisioningScript,
	deleteProvisioningScript
} from '$lib/api/provisioning-scripts';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getProvisioningScript(
		params.id,
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
	const result = await updateProvisioningScript(
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

	await deleteProvisioningScript(params.id, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
