import type { PageServerLoad, Actions } from './$types';
import { getCategory, adminUpdateCategory, adminDeleteCategory, adminListCategories } from '$lib/api/catalog';
import { hasAdminRole } from '$lib/server/auth';
import { error, redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { updateCategorySchema } from '$lib/schemas/catalog';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	const [category, categoriesRes] = await Promise.all([
		getCategory(params.id, locals.accessToken, locals.tenantId, fetch),
		adminListCategories({ limit: 100, offset: 0 }, locals.accessToken, locals.tenantId, fetch)
	]);

	const form = await superValidate(category, zod(updateCategorySchema));
	return { category, form, parentCategories: categoriesRes.items.filter(c => c.id !== params.id) };
};

export const actions: Actions = {
	update: async ({ params, request, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
		if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
		const form = await superValidate(request, zod(updateCategorySchema));
		if (!form.valid) return { form };
		try {
			const payload = { ...form.data, parent_id: form.data.parent_id || undefined };
			await adminUpdateCategory(params.id, payload as any, locals.accessToken, locals.tenantId, fetch);
			redirect(303, '/governance/catalog/admin');
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) error(e.status, e.body.message);
			throw e;
		}
	},
	delete: async ({ params, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
		if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
		try {
			await adminDeleteCategory(params.id, locals.accessToken, locals.tenantId, fetch);
			redirect(303, '/governance/catalog/admin');
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) error(e.status, e.body.message);
			throw e;
		}
	}
};
