import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateBulkActionExpression } from '$lib/api/governance-operations';
import { ApiError } from '$lib/api/client';

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		let parsed: unknown;
		try {
			parsed = await request.json();
		} catch {
			return json({ error: 'Invalid JSON body' }, { status: 400 });
		}
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			return json({ error: 'Invalid JSON body' }, { status: 400 });
		}
		const body = parsed as Record<string, unknown>;
		if (typeof body.expression !== 'string' || body.expression.length === 0) {
			return json({ error: 'expression is required' }, { status: 400 });
		}
		const result = await validateBulkActionExpression(
			{ expression: body.expression },
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to validate expression' }, { status: 500 });
	}
};
