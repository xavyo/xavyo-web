import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateCartItem, removeCartItem } from '$lib/api/catalog';

export const PUT: RequestHandler = async ({ params, request, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const beneficiary_id = url.searchParams.get('beneficiary_id') ?? undefined;
	const body = await request.json();
	const result = await updateCartItem(params.itemId, body, beneficiary_id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const beneficiary_id = url.searchParams.get('beneficiary_id') ?? undefined;
	await removeCartItem(params.itemId, beneficiary_id, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
