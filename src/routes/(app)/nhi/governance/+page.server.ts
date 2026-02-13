import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getNhiRiskSummary, getStalenessReport, listOrphanDetections } from '$lib/api/nhi-governance';
import { listNhi } from '$lib/api/nhi';
import { hasAdminRole } from '$lib/server/auth';
import type { NhiRiskSummary, StalenessReportResponse, OrphanDetectionListResponse } from '$lib/api/types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const defaultRiskSummary: NhiRiskSummary = {
		total_count: 0,
		by_type: { service_account: 0, ai_agent: 0 },
		by_risk_level: { critical: 0, high: 0, medium: 0, low: 0 },
		pending_certification: 0,
		inactive_30_days: 0,
		expiring_7_days: 0
	};

	// Normalize backend risk summary to frontend shape
	function normalizeRiskSummary(raw: Record<string, unknown>): NhiRiskSummary {
		// Backend may return { total_entities, by_type: [], by_level: [] } arrays
		// Frontend expects { total_count, by_type: { service_account, ai_agent }, by_risk_level: {...} }
		const totalCount = (raw.total_count as number) ?? (raw.total_entities as number) ?? 0;

		let byType = defaultRiskSummary.by_type;
		if (raw.by_type && typeof raw.by_type === 'object' && !Array.isArray(raw.by_type)) {
			byType = raw.by_type as typeof byType;
		} else if (Array.isArray(raw.by_type)) {
			byType = { service_account: 0, ai_agent: 0 };
			for (const item of raw.by_type as { type?: string; nhi_type?: string; count?: number }[]) {
				const key = item.type ?? item.nhi_type ?? '';
				if (key === 'service_account') byType.service_account = item.count ?? 0;
				if (key === 'ai_agent' || key === 'agent') byType.ai_agent = item.count ?? 0;
			}
		}

		let byRiskLevel = defaultRiskSummary.by_risk_level;
		const rawLevel = raw.by_risk_level ?? raw.by_level;
		if (rawLevel && typeof rawLevel === 'object' && !Array.isArray(rawLevel)) {
			byRiskLevel = rawLevel as typeof byRiskLevel;
		} else if (Array.isArray(rawLevel)) {
			byRiskLevel = { critical: 0, high: 0, medium: 0, low: 0 };
			for (const item of rawLevel as { level?: string; risk_level?: string; count?: number }[]) {
				const key = (item.level ?? item.risk_level ?? '') as keyof typeof byRiskLevel;
				if (key in byRiskLevel) byRiskLevel[key] = item.count ?? 0;
			}
		}

		return {
			total_count: totalCount,
			by_type: byType,
			by_risk_level: byRiskLevel,
			pending_certification: (raw.pending_certification as number) ?? 0,
			inactive_30_days: (raw.inactive_30_days as number) ?? 0,
			expiring_7_days: (raw.expiring_7_days as number) ?? 0
		};
	}

	// Load each data source independently — if one fails, the others still render
	const [rawRiskSummary, stalenessReport, orphanDetections, nhiList] = await Promise.all([
		getNhiRiskSummary(locals.accessToken!, locals.tenantId!, fetch).catch(
			(): NhiRiskSummary => defaultRiskSummary
		),
		getStalenessReport(locals.accessToken!, locals.tenantId!, fetch).catch(
			(): StalenessReportResponse => ({
				generated_at: new Date().toISOString(),
				min_inactive_days: 30,
				total_stale: 0,
				critical_count: 0,
				warning_count: 0,
				stale_nhis: []
			})
		),
		listOrphanDetections(locals.accessToken!, locals.tenantId!, fetch).catch(
			(): OrphanDetectionListResponse => ({
				items: [],
				total: 0,
				limit: 50,
				offset: 0
			})
		),
		listNhi({ limit: 200, offset: 0 }, locals.accessToken!, locals.tenantId!, fetch).catch(
			() => ({ items: [] as { id: string; name: string }[], data: [] as { id: string; name: string }[] })
		)
	]);

	// Build id→name map for SoD rules display — backend returns `items`, type says `data`
	const nhiNameMap: Record<string, string> = {};
	const entities = (nhiList as Record<string, unknown>).items as { id: string; name: string }[]
		?? (nhiList as Record<string, unknown>).data as { id: string; name: string }[]
		?? [];
	for (const entity of entities) {
		nhiNameMap[entity.id] = entity.name;
	}

	const riskSummary = normalizeRiskSummary(rawRiskSummary as unknown as Record<string, unknown>);

	return { riskSummary, stalenessReport, orphanDetections, nhiNameMap };
};
