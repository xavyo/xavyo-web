import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { evaluateTransitionConditions } from '$lib/api/lifecycle';
import type { EvaluateConditionsRequest } from '$lib/api/types';

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
	if (!body.context || typeof body.context !== 'object' || Array.isArray(body.context)) {
		error(400, 'context is required');
	}
	const data: EvaluateConditionsRequest = { context: body.context as Record<string, unknown> };
	const result = await evaluateTransitionConditions(
		params.configId,
		params.transitionId,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
