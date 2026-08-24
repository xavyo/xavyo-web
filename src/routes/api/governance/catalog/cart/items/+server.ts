import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addToCart } from '$lib/api/catalog';

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
	if (typeof body.catalog_item_id !== 'string' || body.catalog_item_id.length === 0) {
		error(400, 'catalog_item_id is required');
	}
	const result = await addToCart(
		{
			catalog_item_id: body.catalog_item_id,
			beneficiary_id: typeof body.beneficiary_id === 'string' ? body.beneficiary_id : undefined,
			parameters:
				body.parameters && typeof body.parameters === 'object'
					? (body.parameters as Record<string, unknown>)
					: undefined,
			form_values:
				body.form_values && typeof body.form_values === 'object'
					? (body.form_values as Record<string, unknown>)
					: undefined
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result, { status: 201 });
};
