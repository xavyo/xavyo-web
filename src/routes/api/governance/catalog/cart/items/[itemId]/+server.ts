import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateCartItem, removeCartItem } from '$lib/api/catalog';
import type { UpdateCartItemRequest } from '$lib/api/types';

export const PUT: RequestHandler = async ({ params, request, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const beneficiary_id = url.searchParams.get('beneficiary_id') ?? undefined;
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
	const data: UpdateCartItemRequest = {};
	if (body.parameters !== undefined) {
		if (!body.parameters || typeof body.parameters !== 'object' || Array.isArray(body.parameters)) {
			error(400, 'parameters must be an object');
		}
		data.parameters = body.parameters as Record<string, unknown>;
	}
	if (body.form_values !== undefined) {
		if (
			!body.form_values ||
			typeof body.form_values !== 'object' ||
			Array.isArray(body.form_values)
		) {
			error(400, 'form_values must be an object');
		}
		data.form_values = body.form_values as Record<string, unknown>;
	}
	const result = await updateCartItem(
		params.itemId,
		data,
		beneficiary_id,
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const beneficiary_id = url.searchParams.get('beneficiary_id') ?? undefined;
	await removeCartItem(params.itemId, beneficiary_id, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
