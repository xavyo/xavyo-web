import type { PageServerLoad } from './$types';
import type {
	MicroCertificationListResponse,
	MicroCertificationStats,
	TriggerRuleListResponse
} from '$lib/api/types';
import {
	getMyPendingCertifications,
	listMicroCertifications,
	getMicroCertificationStats,
	listTriggerRules
} from '$lib/api/micro-certifications';
import { hasAdminRole } from '$lib/server/auth';
import { error } from '@sveltejs/kit';
import { ApiError } from '$lib/api/client';

function loadError(e: unknown, fallback: string): never {
	if (e instanceof ApiError) error(e.status, e.message);
	error(500, fallback);
}

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const isAdmin = hasAdminRole(locals.user?.roles);

	let myPending: MicroCertificationListResponse;
	try {
		myPending = await getMyPendingCertifications(
			{ limit: 20, offset: 0 },
			locals.accessToken,
			locals.tenantId,
			fetch
		);
	} catch (e) {
		loadError(e, 'Failed to load certifications');
	}

	let allCertifications: MicroCertificationListResponse = {
		items: [],
		total: 0,
		limit: 20,
		offset: 0
	};
	let stats: MicroCertificationStats | null = null;
	let triggerRules: TriggerRuleListResponse = { items: [], total: 0, limit: 20, offset: 0 };

	if (isAdmin) {
		try {
			const [allResult, statsResult, rulesResult] = await Promise.all([
				listMicroCertifications(
					{ limit: 20, offset: 0 },
					locals.accessToken,
					locals.tenantId,
					fetch
				),
				getMicroCertificationStats(locals.accessToken, locals.tenantId, fetch),
				listTriggerRules(
					{ limit: 100, offset: 0 },
					locals.accessToken,
					locals.tenantId,
					fetch
				)
			]);
			allCertifications = allResult;
			stats = statsResult;
			triggerRules = rulesResult;
		} catch (e) {
			loadError(e, 'Failed to load certifications');
		}
	}

	return {
		myPending,
		allCertifications,
		stats,
		triggerRules,
		isAdmin
	};
};
