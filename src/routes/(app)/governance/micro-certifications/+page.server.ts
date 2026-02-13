import type { PageServerLoad } from './$types';
import type { MicroCertificationListResponse, MicroCertificationStats, TriggerRuleListResponse } from '$lib/api/types';
import {
	getMyPendingCertifications,
	listMicroCertifications,
	getMicroCertificationStats,
	listTriggerRules
} from '$lib/api/micro-certifications';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	const isAdmin = hasAdminRole(locals.user?.roles);

	// Always load my pending certifications
	let myPending: MicroCertificationListResponse = { items: [], total: 0, limit: 20, offset: 0 };
	try {
		myPending = await getMyPendingCertifications(
			{ limit: 20, offset: 0 },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
	} catch {
		// Non-critical — show empty
	}

	// Admin-only data
	let allCertifications: MicroCertificationListResponse = { items: [], total: 0, limit: 20, offset: 0 };
	let stats: MicroCertificationStats | null = null;
	let triggerRules: TriggerRuleListResponse = { items: [], total: 0, limit: 20, offset: 0 };

	if (isAdmin) {
		const [allResult, statsResult, rulesResult] = await Promise.allSettled([
			listMicroCertifications(
				{ limit: 20, offset: 0 },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			),
			getMicroCertificationStats(locals.accessToken!, locals.tenantId!, fetch),
			listTriggerRules(
				{ limit: 100, offset: 0 },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			)
		]);

		if (allResult.status === 'fulfilled') allCertifications = allResult.value;
		if (statsResult.status === 'fulfilled') stats = statsResult.value;
		if (rulesResult.status === 'fulfilled') triggerRules = rulesResult.value;
	}

	return {
		myPending,
		allCertifications,
		stats,
		triggerRules,
		isAdmin
	};
};
