import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import {
	listCorrelationCases,
	listIdentityCorrelationRules,
	listCorrelationAuditEvents
} from '$lib/api/correlation';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Admin role required');

	// Load all tab data — catch errors gracefully so one failing tab doesn't break the page
	const [casesResult, identityRulesResult, auditResult] = await Promise.all([
		listCorrelationCases(
			{ status: 'pending', limit: 50, offset: 0 },
			locals.accessToken,
			locals.tenantId,
			fetch
		).catch(() => ({ items: [], total: 0 })),
		listIdentityCorrelationRules(
			{ limit: 50, offset: 0 },
			locals.accessToken,
			locals.tenantId,
			fetch
		).catch(() => ({ items: [], total: 0 })),
		listCorrelationAuditEvents(
			{ limit: 50, offset: 0 },
			locals.accessToken,
			locals.tenantId,
			fetch
		).catch(() => ({ items: [], total: 0 }))
	]);

	return {
		cases: casesResult.items ?? [],
		casesTotal: casesResult.total ?? 0,
		identityRules: identityRulesResult.items ?? [],
		identityRulesTotal: identityRulesResult.total ?? 0,
		auditEvents: auditResult.items ?? [],
		auditTotal: auditResult.total ?? 0
	};
};
