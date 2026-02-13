import type { PageServerLoad, Actions } from './$types';
import { adminCreateItem, adminListCategories } from '$lib/api/catalog';
import { hasAdminRole } from '$lib/server/auth';
import { error, redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { createCatalogItemSchema } from '$lib/schemas/catalog';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	const categoriesRes = await adminListCategories({ limit: 100, offset: 0 }, locals.accessToken, locals.tenantId, fetch);
	const form = await superValidate(zod(createCatalogItemSchema));
	return { form, categories: categoriesRes.items };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
		if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
		const form = await superValidate(request, zod(createCatalogItemSchema));
		if (!form.valid) return { form };
		try {
			const body: Record<string, unknown> = { ...form.data, category_id: form.data.category_id || undefined };
			if (form.data.tags) {
				body.tags = typeof form.data.tags === 'string' ? (form.data.tags as unknown as string).split(',').map(t => t.trim()).filter(Boolean) : form.data.tags;
			}
			await adminCreateItem(body as any, locals.accessToken, locals.tenantId, fetch);
			redirect(303, '/governance/catalog/admin');
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) error(e.status, e.body.message);
			throw e;
		}
	}
};
