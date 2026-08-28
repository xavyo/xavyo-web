import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { executePolicySimulation } from '$lib/api/simulations';
import { ApiError } from '$lib/api/client';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		const text = await request.text();
		let body: { user_ids?: string[] } | undefined;
		if (text.trim()) {
			let parsed: unknown;
			try {
				parsed = JSON.parse(text);
			} catch {
				error(400, 'Invalid JSON body');
			}
			if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
				error(400, 'Invalid JSON body');
			}
			body = parsed as { user_ids?: string[] };
		}
		const result = await executePolicySimulation(
			params.id,
			body,
			locals.accessToken,
			locals.tenantId,
			fetch
		);

		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
