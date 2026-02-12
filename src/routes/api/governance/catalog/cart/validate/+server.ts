import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateCart } from '$lib/api/catalog';

export const POST: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const beneficiary_id = url.searchParams.get('beneficiary_id') ?? undefined;
	const result = await validateCart(beneficiary_id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
