import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { getConflict, resolveConflict } from '$lib/api/operations';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	try {
		const conflict = await getConflict(params.id, locals.accessToken!, locals.tenantId!, fetch);
		return { conflict };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load conflict');
	}
};

export const actions: Actions = {
	resolve: async ({ params, request, locals, fetch }) => {
		const formData = await request.formData();
		const outcome = formData.get('outcome') as string;
		const notes = formData.get('notes') as string | null;
		try {
			await resolveConflict(
				params.id,
				{ outcome: outcome as any, notes: notes || undefined },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'resolved' };
	}
};
