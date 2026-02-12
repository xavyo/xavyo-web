import { describe, it, expect, vi } from 'vitest';

// Mock modules needed by the server load
vi.mock('$lib/api/nhi-governance', () => ({
	getNhiRiskSummary: vi.fn(),
	getStalenessReport: vi.fn(),
	listOrphanDetections: vi.fn()
}));
vi.mock('$lib/api/nhi', () => ({
	listNhi: vi.fn()
}));
vi.mock('$lib/api/client', () => ({
	ApiError: class extends Error {
		status: number;
		constructor(s: number, m: string) {
			super(m);
			this.status = s;
		}
	}
}));
vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

import { load } from './+page.server';
import { getNhiRiskSummary, getStalenessReport, listOrphanDetections } from '$lib/api/nhi-governance';
import { listNhi } from '$lib/api/nhi';
import { hasAdminRole } from '$lib/server/auth';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('NHI Governance hub +page.server', () => {
	it('redirects non-admin users', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		try {
			await load({
				locals: mockLocals(false),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown redirect');
		} catch (e: any) {
			expect(e.status).toBe(302);
			expect(e.location).toBe('/dashboard');
		}
	});

	it('loads risk summary, staleness report, orphan detections, and nhiNameMap', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const summary = {
			total_count: 5,
			by_type: { service_account: 2, ai_agent: 3 },
			by_risk_level: { critical: 0, high: 0, medium: 2, low: 3 },
			pending_certification: 0,
			inactive_30_days: 1,
			expiring_7_days: 0
		};
		const stalenessReport = {
			generated_at: '2026-01-15T00:00:00Z',
			min_inactive_days: 30,
			total_stale: 1,
			critical_count: 0,
			warning_count: 1,
			stale_nhis: [{ nhi_id: 'i1', name: 'stale-tool', owner_id: 'u1', days_inactive: 45, last_used_at: null, inactivity_threshold_days: 30, in_grace_period: false, grace_period_ends_at: null }]
		};
		const orphanDetections = {
			items: [{ id: 'det-1', user_id: 'u2', run_id: 'r1', detection_reason: 'no_owner', status: 'open', detected_at: '2026-01-10T00:00:00Z', last_activity_at: null, days_inactive: null }],
			total: 1,
			limit: 50,
			offset: 0
		};
		const nhiList = {
			items: [
				{ id: 'i1', name: 'stale-tool' },
				{ id: 'o1', name: 'orphan-agent' }
			],
			total: 2,
			page: 1,
			per_page: 200,
			total_pages: 1
		};

		vi.mocked(getNhiRiskSummary).mockResolvedValue(summary as any);
		vi.mocked(getStalenessReport).mockResolvedValue(stalenessReport as any);
		vi.mocked(listOrphanDetections).mockResolvedValue(orphanDetections as any);
		vi.mocked(listNhi).mockResolvedValue(nhiList as any);

		const result: any = await load({
			locals: mockLocals(true),
			fetch: vi.fn()
		} as any);

		expect(result.riskSummary).toEqual(summary);
		expect(result.stalenessReport).toEqual(stalenessReport);
		expect(result.orphanDetections).toEqual(orphanDetections);
		expect(result.nhiNameMap).toEqual({
			i1: 'stale-tool',
			o1: 'orphan-agent'
		});
	});

	it('handles API failures gracefully with fallback data', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		vi.mocked(getNhiRiskSummary).mockRejectedValue(new Error('network'));
		vi.mocked(getStalenessReport).mockRejectedValue(new Error('network'));
		vi.mocked(listOrphanDetections).mockRejectedValue(new Error('network'));
		vi.mocked(listNhi).mockRejectedValue(new Error('network'));

		// Should not throw — page server uses .catch() fallbacks
		const result: any = await load({
			locals: mockLocals(true),
			fetch: vi.fn()
		} as any);

		expect(result.riskSummary.total_count).toBe(0);
		expect(result.stalenessReport.total_stale).toBe(0);
		expect(result.orphanDetections.items).toEqual([]);
		expect(result.nhiNameMap).toEqual({});
	});
});
