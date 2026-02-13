import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCart, clearCart } from '$lib/api/catalog';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const beneficiary_id = url.searchParams.get('beneficiary_id') ?? undefined;
	const result = await getCart(beneficiary_id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const DELETE: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const beneficiary_id = url.searchParams.get('beneficiary_id') ?? undefined;
	await clearCart(beneficiary_id, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
