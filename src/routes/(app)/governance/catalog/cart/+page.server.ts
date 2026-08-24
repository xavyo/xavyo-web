import type { PageServerLoad, Actions } from './$types';
import { getCart, submitCart, removeCartItem, clearCart, validateCart } from '$lib/api/catalog';
import { error, redirect } from '@sveltejs/kit';
import { isRedirect } from '@sveltejs/kit';
import { isHttpError } from '@sveltejs/kit';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		const cart = await getCart(undefined, locals.accessToken, locals.tenantId, fetch);
		return { cart };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load cart');
	}
};

export const actions: Actions = {
	validate: async ({ locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
		const result = await validateCart(undefined, locals.accessToken, locals.tenantId, fetch);
		return { validation: result };
	},
	submit: async ({ request, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
		const formData = await request.formData();
		const justification = formData.get('justification') as string | null;
		try {
			await submitCart({ global_justification: justification || undefined }, locals.accessToken, locals.tenantId, fetch);
			redirect(303, '/my-requests');
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) error(e.status, e.body.message);
			throw e;
		}
	},
	remove: async ({ request, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
		const formData = await request.formData();
		const itemId = formData.get('itemId') as string;
		await removeCartItem(itemId, undefined, locals.accessToken, locals.tenantId, fetch);
		return { success: true };
	},
	clear: async ({ locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
		await clearCart(undefined, locals.accessToken, locals.tenantId, fetch);
		return { success: true };
	}
};
