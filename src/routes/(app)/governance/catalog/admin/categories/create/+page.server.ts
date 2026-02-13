import type { PageServerLoad, Actions } from './$types';
import { adminListCategories, adminCreateCategory } from '$lib/api/catalog';
import { hasAdminRole } from '$lib/server/auth';
import { error, redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { createCategorySchema } from '$lib/schemas/catalog';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	const categoriesRes = await adminListCategories({ limit: 100, offset: 0 }, locals.accessToken, locals.tenantId, fetch);
	const form = await superValidate(zod(createCategorySchema));

	return { form, parentCategories: categoriesRes.items };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
		if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

		const form = await superValidate(request, zod(createCategorySchema));
		if (!form.valid) return { form };

		try {
			const payload = { ...form.data, parent_id: form.data.parent_id || undefined };
			await adminCreateCategory(payload, locals.accessToken, locals.tenantId, fetch);
			redirect(303, '/governance/catalog/admin');
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) error(e.status, e.body.message);
			throw e;
		}
	}
};
