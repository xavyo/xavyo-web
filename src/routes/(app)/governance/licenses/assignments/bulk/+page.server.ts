import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { bulkAssignSchema, bulkReclaimSchema } from '$lib/schemas/licenses';
import { listLicensePools, bulkAssignLicenses, bulkReclaimLicenses } from '$lib/api/licenses';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { BulkAssignLicenseRequest, BulkReclaimLicenseRequest } from '$lib/api/types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const [assignForm, reclaimForm, poolsResponse] = await Promise.all([
		superValidate(zod(bulkAssignSchema)),
		superValidate(zod(bulkReclaimSchema)),
		listLicensePools({ limit: 100 }, locals.accessToken!, locals.tenantId!, fetch)
	]);

	return { assignForm, reclaimForm, pools: poolsResponse.items };
};

export const actions: Actions = {
	bulkAssign: async ({ request, locals, fetch }) => {
		const assignForm = await superValidate(request, zod(bulkAssignSchema));
		if (!assignForm.valid) return fail(400, { assignForm });

		// Parse user_ids from textarea (one per line)
		const userIds = assignForm.data.user_ids
			.split('\n')
			.map((s: string) => s.trim())
			.filter(Boolean);

		if (userIds.length === 0) {
			return message(assignForm, 'At least one user ID is required', {
				status: 400 as ErrorStatus
			});
		}
		if (userIds.length > 1000) {
			return message(assignForm, 'Maximum 1000 user IDs allowed', {
				status: 400 as ErrorStatus
			});
		}

		const body: BulkAssignLicenseRequest = {
			license_pool_id: assignForm.data.license_pool_id,
			user_ids: userIds,
			source: assignForm.data.source || undefined
		};

		try {
			const result = await bulkAssignLicenses(
				body,
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
			return { assignForm, bulkResult: result, action: 'assign' as const };
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) {
				return message(assignForm, e.message, { status: e.status as ErrorStatus });
			}
			return message(assignForm, 'An unexpected error occurred', { status: 500 });
		}
	},

	bulkReclaim: async ({ request, locals, fetch }) => {
		const reclaimForm = await superValidate(request, zod(bulkReclaimSchema));
		if (!reclaimForm.valid) return fail(400, { reclaimForm });

		const assignmentIds = reclaimForm.data.assignment_ids
			.split('\n')
			.map((s: string) => s.trim())
			.filter(Boolean);

		if (assignmentIds.length === 0) {
			return message(reclaimForm, 'At least one assignment ID is required', {
				status: 400 as ErrorStatus
			});
		}

		const body: BulkReclaimLicenseRequest = {
			license_pool_id: reclaimForm.data.license_pool_id,
			assignment_ids: assignmentIds,
			reason: reclaimForm.data.reason
		};

		try {
			const result = await bulkReclaimLicenses(
				body,
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
			return { reclaimForm, bulkResult: result, action: 'reclaim' as const };
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) {
				return message(reclaimForm, e.message, { status: e.status as ErrorStatus });
			}
			return message(reclaimForm, 'An unexpected error occurred', { status: 500 });
		}
	}
};
