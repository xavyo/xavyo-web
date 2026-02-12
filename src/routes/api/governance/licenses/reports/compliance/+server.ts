import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { generateComplianceReport } from '$lib/api/licenses';
import { ApiError } from '$lib/api/client';
import type { ComplianceReport } from '$lib/api/types';

// Backend returns a different shape than our frontend ComplianceReport type.
// Normalize here in the BFF layer.
function normalizeComplianceReport(raw: Record<string, unknown>): ComplianceReport {
	const poolSummaries = (raw.pool_summaries as Record<string, unknown>[]) ?? [];
	const totalPools = Number(raw.total_pools ?? poolSummaries.length);
	const totalLicenses = Number(raw.total_licenses ?? 0);
	const totalAssigned = Number(raw.total_assigned ?? 0);
	const overallScore = Number(raw.overall_compliance_score ?? 0);

	const pools = poolSummaries.map((ps) => ({
		pool_id: String(ps.pool_id ?? ''),
		pool_name: String(ps.pool_name ?? ''),
		vendor: String(ps.vendor ?? ''),
		total_capacity: Number(ps.total_capacity ?? 0),
		allocated_count: Number(ps.allocated_count ?? 0),
		utilization_percent: Number(ps.utilization_percent ?? 0),
		status: String(ps.status ?? 'active') as 'active' | 'expired' | 'archived',
		expiration_date: ps.expiration_date ? String(ps.expiration_date) : null,
		is_compliant: !ps.is_over_allocated,
		issues: ps.is_over_allocated ? ['Over-allocated'] : []
	}));

	const compliantPools = pools.filter((p) => p.is_compliant).length;

	return {
		generated_at: String(raw.generated_at ?? new Date().toISOString()),
		pools,
		summary: {
			total_pools_reviewed: totalPools,
			compliant_pools: compliantPools,
			non_compliant_pools: totalPools - compliantPools,
			total_capacity: totalLicenses,
			total_allocated: totalAssigned,
			overall_utilization: totalLicenses > 0 ? (totalAssigned / totalLicenses) * 100 : 0
		}
	};
}

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	try {
		const text = await request.text();
		const body = text ? JSON.parse(text) : undefined;
		const raw = await generateComplianceReport(
			body,
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		const normalized = normalizeComplianceReport(raw as unknown as Record<string, unknown>);
		return json(normalized);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to generate compliance report' }, { status: 500 });
	}
};
