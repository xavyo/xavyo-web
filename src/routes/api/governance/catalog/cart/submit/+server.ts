import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { submitCart } from '$lib/api/catalog';

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
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
	const result = await submitCart(
		{
			beneficiary_id: typeof body.beneficiary_id === 'string' ? body.beneficiary_id : undefined,
			global_justification:
				typeof body.global_justification === 'string' ? body.global_justification : undefined
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result, { status: 201 });
};
