import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateExpression } from '$lib/api/correlation';
import type { ValidateExpressionRequest } from '$lib/api/types';

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
	if (typeof body.expression !== 'string' || body.expression.length === 0) {
		error(400, 'expression is required');
	}
	const data: ValidateExpressionRequest = { expression: body.expression };
	if (body.test_input !== undefined) {
		if (!body.test_input || typeof body.test_input !== 'object' || Array.isArray(body.test_input)) {
			error(400, 'test_input must be an object');
		}
		const input = body.test_input as Record<string, unknown>;
		if (!input.source || typeof input.source !== 'object' || Array.isArray(input.source)) {
			error(400, 'test_input.source is required');
		}
		if (!input.target || typeof input.target !== 'object' || Array.isArray(input.target)) {
			error(400, 'test_input.target is required');
		}
		data.test_input = {
			source: input.source as Record<string, unknown>,
			target: input.target as Record<string, unknown>
		};
	}
	const result = await validateExpression(params.connectorId, data, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
