import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { getManualTask, claimTask, startTask, confirmTask, rejectTask, cancelTask } from '$lib/api/manual-tasks';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	let task;
	try {
		task = await getManualTask(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load manual task');
	}

	return { task };
};

export const actions: Actions = {
	claim: async ({ params, locals, fetch }) => {
		try {
			await claimTask(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'Failed to claim task' });
		}
		return { success: true, action: 'claimed' };
	},

	start: async ({ params, locals, fetch }) => {
		try {
			await startTask(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'Failed to start task' });
		}
		return { success: true, action: 'started' };
	},

	confirm: async ({ request, params, locals, fetch }) => {
		const formData = await request.formData();
		const notes = formData.get('notes') as string || undefined;

		try {
			await confirmTask(params.id, { notes }, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'Failed to confirm task' });
		}
		return { success: true, action: 'confirmed' };
	},

	reject: async ({ request, params, locals, fetch }) => {
		const formData = await request.formData();
		const reason = formData.get('reason') as string;

		if (!reason || reason.length < 5) {
			return fail(400, { error: 'Reason must be at least 5 characters' });
		}

		try {
			await rejectTask(params.id, { reason }, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'Failed to reject task' });
		}
		return { success: true, action: 'rejected' };
	},

	cancel: async ({ params, locals, fetch }) => {
		try {
			await cancelTask(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'Failed to cancel task' });
		}
		return { success: true, action: 'cancelled' };
	}
};
