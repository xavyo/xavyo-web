import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { simulatePolicy } from '$lib/api/birthright';
import type { SimulatePolicyRequest } from '$lib/api/types';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
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
	if (!body.attributes || typeof body.attributes !== 'object' || Array.isArray(body.attributes)) {
		error(400, 'attributes is required');
	}
	const data: SimulatePolicyRequest = { attributes: body.attributes as Record<string, unknown> };
	const result = await simulatePolicy(params.id, data, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
