import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import {
	listDiscrepancies,
	remediateDiscrepancy,
	ignoreDiscrepancy,
	bulkRemediate
} from '$lib/api/reconciliation';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) redirect(302, '/dashboard');

	const run_id = url.searchParams.get('run_id') ?? undefined;
	const discrepancy_type = url.searchParams.get('discrepancy_type') ?? undefined;
	const resolution_status = url.searchParams.get('resolution_status') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	try {
		const result = await listDiscrepancies(
			params.id,
			{ run_id, discrepancy_type, resolution_status, limit, offset },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return { discrepancies: result, connectorId: params.id };
	} catch {
		return {
			discrepancies: { discrepancies: [], total: 0, limit, offset },
			connectorId: params.id
		};
	}
};

export const actions: Actions = {
	remediate: async ({ params, request, locals, fetch }) => {
		const fd = await request.formData();
		const discrepancy_id = fd.get('discrepancy_id') as string;
		const action = fd.get('action') as string;
		const direction = fd.get('direction') as string;

		try {
			const result = await remediateDiscrepancy(
				params.id,
				discrepancy_id,
				{
					action: action as RemediateAction,
					direction: direction as RemediateDirection,
					dry_run: false
				},
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
			return { success: true, result };
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'An unexpected error occurred' });
		}
	},

	ignore: async ({ params, request, locals, fetch }) => {
		const fd = await request.formData();
		const discrepancy_id = fd.get('discrepancy_id') as string;

		try {
			await ignoreDiscrepancy(
				params.id,
				discrepancy_id,
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
			return { success: true, action: 'ignored' };
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'An unexpected error occurred' });
		}
	},

	bulk_remediate: async ({ params, request, locals, fetch }) => {
		const fd = await request.formData();
		const selected_ids = JSON.parse(fd.get('selected_ids') as string) as string[];
		const action = fd.get('action') as string;
		const direction = fd.get('direction') as string;

		try {
			const result = await bulkRemediate(
				params.id,
				{
					items: selected_ids.map((id) => ({
						discrepancy_id: id,
						action: action as RemediateAction,
						direction: direction as RemediateDirection
					})),
					dry_run: false
				},
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
			return { success: true, bulkResult: result };
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'An unexpected error occurred' });
		}
	}
};

// Internal type aliases for casting form data
type RemediateAction = 'create' | 'update' | 'delete' | 'link' | 'unlink' | 'inactivate_identity';
type RemediateDirection = 'xavyo_to_target' | 'target_to_xavyo';
