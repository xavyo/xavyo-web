import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import {
	getOperation,
	getOperationAttempts,
	getOperationLogs,
	retryOperation,
	cancelOperation,
	resolveOperation
} from '$lib/api/operations';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	try {
		const [operation, attempts, logs] = await Promise.all([
			getOperation(params.id, locals.accessToken!, locals.tenantId!, fetch),
			getOperationAttempts(params.id, locals.accessToken!, locals.tenantId!, fetch).catch(
				() => ({ attempts: [], operation_id: params.id })
			),
			getOperationLogs(params.id, locals.accessToken!, locals.tenantId!, fetch).catch(
				() => ({ logs: [], operation_id: params.id })
			)
		]);

		return { operation, attempts: attempts.attempts, logs: logs.logs };
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load operation');
	}
};

export const actions: Actions = {
	retry: async ({ params, locals, fetch }) => {
		try {
			await retryOperation(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'retried' };
	},

	cancel: async ({ params, locals, fetch }) => {
		try {
			await cancelOperation(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'cancelled' };
	},

	resolve: async ({ params, request, locals, fetch }) => {
		const formData = await request.formData();
		const resolution_notes = formData.get('resolution_notes') as string | null;
		try {
			await resolveOperation(
				params.id,
				{ resolution_notes: resolution_notes || undefined },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'resolved' };
	}
};
