import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getObjectTemplate } from '$lib/api/object-templates';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, params }) => {

	try {
		const template = await getObjectTemplate(params.id, locals.accessToken!, locals.tenantId!);
		return { template };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load object template');
	}
};
