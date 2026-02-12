import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getBranding, updateBranding } from '$lib/api/branding';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getBranding(locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const PUT: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const result = await updateBranding(body, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
