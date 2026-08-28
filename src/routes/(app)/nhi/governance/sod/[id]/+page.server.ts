import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { getNhiSodRule, deleteNhiSodRule } from '$lib/api/nhi-governance';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {

	let rule;
	try {
		rule = await getNhiSodRule(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load NHI SoD rule');
	}

	return { rule };
};

export const actions: Actions = {
	delete: async ({ params, locals, fetch }) => {

		try {
			await deleteNhiSodRule(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		redirect(302, '/nhi/governance');
	}
};
