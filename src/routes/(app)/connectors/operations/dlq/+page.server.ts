import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { getOperationsDlq, retryOperation, resolveOperation } from '$lib/api/operations';
import { listConnectors } from '$lib/api/connectors';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const connector_id = url.searchParams.get('connector_id') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	try {
		const [dlq, connectors] = await Promise.all([
			getOperationsDlq(
				{ connector_id, limit, offset },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			),
			listConnectors(
				{ limit: 100, offset: 0 },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			).catch(() => ({ items: [], total: 0, limit: 100, offset: 0 }))
		]);

		return { dlq, connectors: connectors.items };
	} catch {
		return {
			dlq: { operations: [], offset, limit },
			connectors: []
		};
	}
};

export const actions: Actions = {
	retry: async ({ request, locals, fetch }) => {
		const formData = await request.formData();
		const id = formData.get('operation_id') as string;
		try {
			await retryOperation(id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'retried' };
	},

	resolve: async ({ request, locals, fetch }) => {
		const formData = await request.formData();
		const id = formData.get('operation_id') as string;
		const resolution_notes = formData.get('resolution_notes') as string | null;
		try {
			await resolveOperation(
				id,
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
