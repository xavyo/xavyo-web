import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import {
	listCorrelationCases,
	listIdentityCorrelationRules,
	listCorrelationAuditEvents
} from '$lib/api/correlation';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		const [casesResult, identityRulesResult, auditResult] = await Promise.all([
			listCorrelationCases(
				{ status: 'pending', limit: 50, offset: 0 },
				locals.accessToken,
				locals.tenantId,
				fetch
			),
			listIdentityCorrelationRules(
				{ limit: 50, offset: 0 },
				locals.accessToken,
				locals.tenantId,
				fetch
			),
			listCorrelationAuditEvents(
				{ limit: 50, offset: 0 },
				locals.accessToken,
				locals.tenantId,
				fetch
			)
		]);

		return {
			cases: casesResult.items ?? [],
			casesTotal: casesResult.total ?? 0,
			identityRules: identityRulesResult.items ?? [],
			identityRulesTotal: identityRulesResult.total ?? 0,
			auditEvents: auditResult.items ?? [],
			auditTotal: auditResult.total ?? 0
		};
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load correlation data');
	}
};
