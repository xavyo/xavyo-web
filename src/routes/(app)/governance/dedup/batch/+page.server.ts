import type { PageServerLoad, Actions } from './$types';
import { error, isHttpError, redirect } from '@sveltejs/kit';
import { listDuplicates, previewBatchMerge, executeBatchMerge } from '$lib/api/dedup';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { ErrorStatus } from 'sveltekit-superforms';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	try {
		const pendingDuplicates = await listDuplicates(
			{ status: 'pending', limit: 100, offset: 0 },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);

		return { pendingDuplicates };
	} catch (e) {
		if (isHttpError(e)) throw e;
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load pending duplicates');
	}
};

export const actions = {
	preview: async ({ request, locals, fetch }) => {
		if (!hasAdminRole(locals.user?.roles)) {
			redirect(302, '/dashboard');
		}

		try {
			const formData = await request.formData();
			const candidateIds = formData.getAll('candidate_ids').map(String);
			const strategy = formData.get('entitlement_strategy')?.toString() ?? 'union';
			const attributeRule = formData.get('attribute_rule')?.toString() ?? 'newest_wins';

			if (candidateIds.length === 0) {
				return { success: false, error: 'Select at least one candidate' };
			}

			const preview = await previewBatchMerge(
				{
					candidate_ids: candidateIds,
					entitlement_strategy: strategy as 'union' | 'intersection' | 'manual',
					attribute_rule: attributeRule as 'newest_wins' | 'oldest_wins' | 'prefer_non_null'
				},
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);

			return { success: true, preview };
		} catch (e) {
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) {
				return { success: false, error: e.message };
			}
			return { success: false, error: 'Failed to preview batch merge' };
		}
	},

	execute: async ({ request, locals, fetch }) => {
		if (!hasAdminRole(locals.user?.roles)) {
			redirect(302, '/dashboard');
		}

		try {
			const formData = await request.formData();
			const candidateIds = formData.getAll('candidate_ids').map(String);
			const strategy = formData.get('entitlement_strategy')?.toString() ?? 'union';
			const attributeRule = formData.get('attribute_rule')?.toString() ?? 'newest_wins';
			const skipSod = formData.get('skip_sod_violations') === 'true';

			if (candidateIds.length === 0) {
				return { success: false, error: 'Select at least one candidate' };
			}

			const result = await executeBatchMerge(
				{
					candidate_ids: candidateIds,
					entitlement_strategy: strategy as 'union' | 'intersection' | 'manual',
					attribute_rule: attributeRule as 'newest_wins' | 'oldest_wins' | 'prefer_non_null',
					skip_sod_violations: skipSod
				},
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);

			return { success: true, result };
		} catch (e) {
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) {
				return { success: false, error: e.message };
			}
			return { success: false, error: 'Failed to execute batch merge' };
		}
	}
} satisfies Actions;
