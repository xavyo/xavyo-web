import type { PageServerLoad, Actions } from './$types';
import { getCatalogItem, adminUpdateItem, adminEnableItem, adminDisableItem, adminDeleteItem, adminListCategories } from '$lib/api/catalog';
import { hasAdminRole } from '$lib/server/auth';
import { error, redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { updateCatalogItemSchema } from '$lib/schemas/catalog';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	const [item, categoriesRes] = await Promise.all([
		getCatalogItem(params.id, undefined, locals.accessToken, locals.tenantId, fetch),
		adminListCategories({ limit: 100, offset: 0 }, locals.accessToken, locals.tenantId, fetch)
	]);

	const form = await superValidate(item as any, zod(updateCatalogItemSchema));
	return { item, form, categories: categoriesRes.items };
};

export const actions: Actions = {
	update: async ({ params, request, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
		if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
		const form = await superValidate(request, zod(updateCatalogItemSchema));
		if (!form.valid) return { form };
		try {
			await adminUpdateItem(params.id, form.data as any, locals.accessToken, locals.tenantId, fetch);
			redirect(303, '/governance/catalog/admin');
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) error(e.status, e.body.message);
			throw e;
		}
	},
	enable: async ({ params, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
		if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
		await adminEnableItem(params.id, locals.accessToken, locals.tenantId, fetch);
		return { success: true };
	},
	disable: async ({ params, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
		if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
		await adminDisableItem(params.id, locals.accessToken, locals.tenantId, fetch);
		return { success: true };
	},
	delete: async ({ params, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
		if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
		try {
			await adminDeleteItem(params.id, locals.accessToken, locals.tenantId, fetch);
			redirect(303, '/governance/catalog/admin');
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) error(e.status, e.body.message);
			throw e;
		}
	}
};
