import type { Actions, PageServerLoad } from './$types';
import { getA2aTask, cancelA2aTask } from '$lib/api/a2a';
import { error, fail } from '@sveltejs/kit';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	let task;
	try {
		task = await getA2aTask(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load task');
	}
	return { task };
};

export const actions: Actions = {
	cancel: async ({ params, locals, fetch }) => {
		try {
			await cancelA2aTask(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true };
	}
};
