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
	let beneficiary_id: string | undefined;
	if (body.beneficiary_id !== undefined) {
		if (typeof body.beneficiary_id !== 'string') {
			error(400, 'beneficiary_id must be a string');
		}
		beneficiary_id = body.beneficiary_id;
	}
	let parameters: Record<string, unknown> | undefined;
	if (body.parameters !== undefined) {
		if (!body.parameters || typeof body.parameters !== 'object' || Array.isArray(body.parameters)) {
			error(400, 'parameters must be an object');
		}
		parameters = body.parameters as Record<string, unknown>;
	}
	let form_values: Record<string, unknown> | undefined;
	if (body.form_values !== undefined) {
		if (
			!body.form_values ||
			typeof body.form_values !== 'object' ||
			Array.isArray(body.form_values)
		) {
			error(400, 'form_values must be an object');
		}
		form_values = body.form_values as Record<string, unknown>;
	}
	const result = await addToCart(
		{
			catalog_item_id: body.catalog_item_id,
			beneficiary_id,
			parameters,
			form_values
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result, { status: 201 });
};
