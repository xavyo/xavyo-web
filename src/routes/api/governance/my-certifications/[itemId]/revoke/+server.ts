import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { revokeItem } from '$lib/api/my-certifications';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	let parsed: unknown = {};
	const text = await request.text();
	if (text.trim()) {
		try {
			parsed = JSON.parse(text) as unknown;
		} catch {
			error(400, 'Invalid JSON body');
		}
	}
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		error(400, 'Invalid JSON body');
	}
	const body = parsed as Record<string, unknown>;
	const justification =
		typeof body.justification === 'string'
			? body.justification
			: typeof body.comment === 'string'
				? body.comment
				: '';
	if (justification.trim().length < 20) {
		error(400, 'Justification must be at least 20 characters');
	}

	const result = await revokeItem(
		params.itemId,
		justification.trim(),
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
