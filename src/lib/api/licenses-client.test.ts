import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	fetchLicensePools,
	deletePoolClient,
	archivePoolClient,
	fetchLicenseAssignments,
	deallocateAssignmentClient,
	fetchLicenseDashboard,
	fetchLicenseRecommendations,
	fetchExpiringPools,
	fetchReclamationRules,
	deleteRuleClient,
	fetchLicenseIncompatibilities,
	deleteIncompatibilityClient,
	fetchEntitlementLinks,
	deleteEntitlementLinkClient,
	toggleEntitlementLinkClient,
	generateComplianceReportClient,
	fetchLicenseAuditTrail
} from './licenses-client';

function mockFetch(data: unknown, ok = true, status = 200) {
	return vi.fn().mockResolvedValue({
		ok,
		status,
		json: () => Promise.resolve(data)
	}) as unknown as typeof fetch;
}

describe('licenses-client', () => {
	// --- Pools ---

	describe('fetchLicensePools', () => {
		it('fetches pools with no filters', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			const fetchFn = mockFetch(data);
			const result = await fetchLicensePools({}, fetchFn);
			expect(result).toEqual(data);
			expect(fetchFn).toHaveBeenCalledOnce();
			const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
			expect(url).toBe('/api/governance/licenses/pools');
		});

		it('fetches pools with filters', async () => {
			const data = { items: [{ id: 'p1' }], total: 1, limit: 10, offset: 0 };
			const fetchFn = mockFetch(data);
			const result = await fetchLicensePools(
				{ vendor: 'Microsoft', license_type: 'per_seat', status: 'active', limit: 10, offset: 0 },
				fetchFn
			);
			expect(result).toEqual(data);
			const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
			expect(url).toContain('/api/governance/licenses/pools?');
			expect(url).toContain('vendor=Microsoft');
			expect(url).toContain('license_type=per_seat');
			expect(url).toContain('status=active');
			expect(url).toContain('limit=10');
			expect(url).toContain('offset=0');
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 500);
			await expect(fetchLicensePools({}, fetchFn)).rejects.toThrow('Failed to fetch license pools: 500');
		});
	});

	describe('deletePoolClient', () => {
		it('sends DELETE request for pool', async () => {
			const fetchFn = mockFetch(null);
			await deletePoolClient('pool-1', fetchFn);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/licenses/pools/pool-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 404);
			await expect(deletePoolClient('bad-id', fetchFn)).rejects.toThrow(
				'Failed to delete license pool: 404'
			);
		});
	});

	describe('archivePoolClient', () => {
		it('sends POST to archive endpoint', async () => {
			const pool = { id: 'pool-1', name: 'Archived Pool', status: 'archived' };
			const fetchFn = mockFetch(pool);
			const result = await archivePoolClient('pool-1', fetchFn);
			expect(result).toEqual(pool);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/licenses/pools/pool-1/archive', {
				method: 'POST'
			});
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 409);
			await expect(archivePoolClient('pool-1', fetchFn)).rejects.toThrow(
				'Failed to archive license pool: 409'
			);
		});
	});

	// --- Assignments ---

	describe('fetchLicenseAssignments', () => {
		it('fetches assignments with no filters', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			const fetchFn = mockFetch(data);
			const result = await fetchLicenseAssignments({}, fetchFn);
			expect(result).toEqual(data);
			const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
			expect(url).toBe('/api/governance/licenses/assignments');
		});

		it('fetches assignments with filters', async () => {
			const data = { items: [{ id: 'a1' }], total: 1, limit: 10, offset: 0 };
			const fetchFn = mockFetch(data);
			await fetchLicenseAssignments(
				{ license_pool_id: 'pool-1', user_id: 'user-1', status: 'active', source: 'manual', limit: 10, offset: 5 },
				fetchFn
			);
			const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
			expect(url).toContain('license_pool_id=pool-1');
			expect(url).toContain('user_id=user-1');
			expect(url).toContain('status=active');
			expect(url).toContain('source=manual');
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 500);
			await expect(fetchLicenseAssignments({}, fetchFn)).rejects.toThrow(
				'Failed to fetch license assignments: 500'
			);
		});
	});

	describe('deallocateAssignmentClient', () => {
		it('sends DELETE request for assignment', async () => {
			const fetchFn = mockFetch(null);
			await deallocateAssignmentClient('assign-1', fetchFn);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/licenses/assignments/assign-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 403);
			await expect(deallocateAssignmentClient('assign-1', fetchFn)).rejects.toThrow(
				'Failed to deallocate license assignment: 403'
			);
		});
	});

	// --- Analytics ---

	describe('fetchLicenseDashboard', () => {
		it('fetches dashboard from analytics endpoint', async () => {
			const data = { total_pools: 5, total_assignments: 100, utilization_rate: 0.85 };
			const fetchFn = mockFetch(data);
			const result = await fetchLicenseDashboard(fetchFn);
			expect(result).toEqual(data);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/licenses/analytics/dashboard');
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 500);
			await expect(fetchLicenseDashboard(fetchFn)).rejects.toThrow(
				'Failed to fetch license dashboard: 500'
			);
		});
	});

	describe('fetchLicenseRecommendations', () => {
		it('fetches recommendations array', async () => {
			const data = [{ id: 'r1', type: 'reclaim', description: 'Reclaim unused' }];
			const fetchFn = mockFetch(data);
			const result = await fetchLicenseRecommendations(fetchFn);
			expect(result).toEqual(data);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/licenses/analytics/recommendations');
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 500);
			await expect(fetchLicenseRecommendations(fetchFn)).rejects.toThrow(
				'Failed to fetch license recommendations: 500'
			);
		});
	});

	describe('fetchExpiringPools', () => {
		it('fetches expiring pools without withinDays', async () => {
			const data = { items: [], total: 0 };
			const fetchFn = mockFetch(data);
			const result = await fetchExpiringPools(undefined, fetchFn);
			expect(result).toEqual(data);
			const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
			expect(url).toBe('/api/governance/licenses/analytics/expiring');
		});

		it('fetches expiring pools with withinDays', async () => {
			const data = { items: [{ id: 'p1' }], total: 1 };
			const fetchFn = mockFetch(data);
			await fetchExpiringPools(30, fetchFn);
			const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
			expect(url).toBe('/api/governance/licenses/analytics/expiring?within_days=30');
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 500);
			await expect(fetchExpiringPools(undefined, fetchFn)).rejects.toThrow(
				'Failed to fetch expiring pools: 500'
			);
		});
	});

	// --- Reclamation Rules ---

	describe('fetchReclamationRules', () => {
		it('fetches rules with no filters', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			const fetchFn = mockFetch(data);
			const result = await fetchReclamationRules({}, fetchFn);
			expect(result).toEqual(data);
			const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
			expect(url).toBe('/api/governance/licenses/reclamation-rules');
		});

		it('fetches rules with filters including boolean enabled', async () => {
			const data = { items: [{ id: 'r1' }], total: 1, limit: 10, offset: 0 };
			const fetchFn = mockFetch(data);
			await fetchReclamationRules(
				{ license_pool_id: 'pool-1', trigger_type: 'inactivity', enabled: true, limit: 10 },
				fetchFn
			);
			const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
			expect(url).toContain('license_pool_id=pool-1');
			expect(url).toContain('trigger_type=inactivity');
			expect(url).toContain('enabled=true');
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 500);
			await expect(fetchReclamationRules({}, fetchFn)).rejects.toThrow(
				'Failed to fetch reclamation rules: 500'
			);
		});
	});

	describe('deleteRuleClient', () => {
		it('sends DELETE request for rule', async () => {
			const fetchFn = mockFetch(null);
			await deleteRuleClient('rule-1', fetchFn);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/licenses/reclamation-rules/rule-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 404);
			await expect(deleteRuleClient('rule-1', fetchFn)).rejects.toThrow(
				'Failed to delete reclamation rule: 404'
			);
		});
	});

	// --- Incompatibilities ---

	describe('fetchLicenseIncompatibilities', () => {
		it('fetches incompatibilities with no filters', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			const fetchFn = mockFetch(data);
			const result = await fetchLicenseIncompatibilities({}, fetchFn);
			expect(result).toEqual(data);
			const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
			expect(url).toBe('/api/governance/licenses/incompatibilities');
		});

		it('fetches incompatibilities with pool_id filter', async () => {
			const data = { items: [{ id: 'inc-1' }], total: 1, limit: 20, offset: 0 };
			const fetchFn = mockFetch(data);
			await fetchLicenseIncompatibilities({ pool_id: 'pool-1' }, fetchFn);
			const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
			expect(url).toContain('pool_id=pool-1');
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 500);
			await expect(fetchLicenseIncompatibilities({}, fetchFn)).rejects.toThrow(
				'Failed to fetch license incompatibilities: 500'
			);
		});
	});

	describe('deleteIncompatibilityClient', () => {
		it('sends DELETE request for incompatibility', async () => {
			const fetchFn = mockFetch(null);
			await deleteIncompatibilityClient('inc-1', fetchFn);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/licenses/incompatibilities/inc-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 404);
			await expect(deleteIncompatibilityClient('inc-1', fetchFn)).rejects.toThrow(
				'Failed to delete license incompatibility: 404'
			);
		});
	});

	// --- Entitlement Links ---

	describe('fetchEntitlementLinks', () => {
		it('fetches links with no filters', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			const fetchFn = mockFetch(data);
			const result = await fetchEntitlementLinks({}, fetchFn);
			expect(result).toEqual(data);
			const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
			expect(url).toBe('/api/governance/licenses/entitlement-links');
		});

		it('fetches links with filters', async () => {
			const data = { items: [{ id: 'el-1' }], total: 1, limit: 10, offset: 0 };
			const fetchFn = mockFetch(data);
			await fetchEntitlementLinks(
				{ license_pool_id: 'pool-1', entitlement_id: 'ent-1', enabled: true },
				fetchFn
			);
			const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
			expect(url).toContain('license_pool_id=pool-1');
			expect(url).toContain('entitlement_id=ent-1');
			expect(url).toContain('enabled=true');
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 500);
			await expect(fetchEntitlementLinks({}, fetchFn)).rejects.toThrow(
				'Failed to fetch entitlement links: 500'
			);
		});
	});

	describe('deleteEntitlementLinkClient', () => {
		it('sends DELETE request for entitlement link', async () => {
			const fetchFn = mockFetch(null);
			await deleteEntitlementLinkClient('el-1', fetchFn);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/licenses/entitlement-links/el-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 404);
			await expect(deleteEntitlementLinkClient('el-1', fetchFn)).rejects.toThrow(
				'Failed to delete entitlement link: 404'
			);
		});
	});

	describe('toggleEntitlementLinkClient', () => {
		it('sends PUT with enabled=true', async () => {
			const link = { id: 'el-1', enabled: true };
			const fetchFn = mockFetch(link);
			const result = await toggleEntitlementLinkClient('el-1', true, fetchFn);
			expect(result).toEqual(link);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/licenses/entitlement-links/el-1/enabled', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ enabled: true })
			});
		});

		it('sends PUT with enabled=false', async () => {
			const link = { id: 'el-1', enabled: false };
			const fetchFn = mockFetch(link);
			const result = await toggleEntitlementLinkClient('el-1', false, fetchFn);
			expect(result).toEqual(link);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/licenses/entitlement-links/el-1/enabled', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ enabled: false })
			});
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 409);
			await expect(toggleEntitlementLinkClient('el-1', true, fetchFn)).rejects.toThrow(
				'Failed to toggle entitlement link: 409'
			);
		});
	});

	// --- Reports ---

	describe('generateComplianceReportClient', () => {
		it('sends POST with no body', async () => {
			const report = { id: 'rpt-1', status: 'completed' };
			const fetchFn = mockFetch(report);
			const result = await generateComplianceReportClient(undefined, fetchFn);
			expect(result).toEqual(report);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/licenses/reports/compliance', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({})
			});
		});

		it('sends POST with request body', async () => {
			const report = { id: 'rpt-2', status: 'completed' };
			const body = { pool_ids: ['pool-1'], include_assignments: true } as any;
			const fetchFn = mockFetch(report);
			const result = await generateComplianceReportClient(body, fetchFn);
			expect(result).toEqual(report);
			expect(fetchFn).toHaveBeenCalledWith('/api/governance/licenses/reports/compliance', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 500);
			await expect(generateComplianceReportClient(undefined, fetchFn)).rejects.toThrow(
				'Failed to generate compliance report: 500'
			);
		});
	});

	describe('fetchLicenseAuditTrail', () => {
		it('fetches audit trail with no filters', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			const fetchFn = mockFetch(data);
			const result = await fetchLicenseAuditTrail({}, fetchFn);
			expect(result).toEqual(data);
			const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
			expect(url).toBe('/api/governance/licenses/reports/audit-trail');
		});

		it('fetches audit trail with filters', async () => {
			const data = { items: [{ id: 'at-1' }], total: 1, limit: 10, offset: 0 };
			const fetchFn = mockFetch(data);
			await fetchLicenseAuditTrail(
				{ pool_id: 'pool-1', user_id: 'user-1', action: 'allocate', from_date: '2026-01-01', to_date: '2026-02-01', limit: 10, offset: 0 },
				fetchFn
			);
			const url = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
			expect(url).toContain('pool_id=pool-1');
			expect(url).toContain('user_id=user-1');
			expect(url).toContain('action=allocate');
			expect(url).toContain('from_date=2026-01-01');
			expect(url).toContain('to_date=2026-02-01');
		});

		it('throws on non-ok response', async () => {
			const fetchFn = mockFetch(null, false, 403);
			await expect(fetchLicenseAuditTrail({}, fetchFn)).rejects.toThrow(
				'Failed to fetch license audit trail: 403'
			);
		});
	});
});
