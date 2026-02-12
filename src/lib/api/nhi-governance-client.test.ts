import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('nhi-governance-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	// --- Risk ---

	describe('fetchNhiRisk', () => {
		it('fetches from /api/nhi/governance/risk/:id', async () => {
			const data = { nhi_id: 'nhi-1', total_score: 45, risk_level: 'medium', common_factors: [], type_specific_factors: [] };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchNhiRisk } = await import('./nhi-governance-client');

			const result = await fetchNhiRisk('nhi-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/governance/risk/nhi-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchNhiRisk } = await import('./nhi-governance-client');

			await expect(fetchNhiRisk('bad', mockFetch)).rejects.toThrow('Failed to fetch NHI risk: 404');
		});
	});

	describe('fetchNhiRiskSummary', () => {
		it('fetches from /api/nhi/governance/risk/summary', async () => {
			const data = { total_entities: 10, by_type: [], by_level: [] };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchNhiRiskSummary } = await import('./nhi-governance-client');

			const result = await fetchNhiRiskSummary(mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/governance/risk/summary');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchNhiRiskSummary } = await import('./nhi-governance-client');

			await expect(fetchNhiRiskSummary(mockFetch)).rejects.toThrow('Failed to fetch NHI risk summary: 500');
		});
	});

	// --- Inactivity ---

	describe('fetchInactiveNhis', () => {
		it('fetches from /api/nhi/governance/inactivity', async () => {
			const data = [{ id: 'nhi-1', name: 'Old Tool', nhi_type: 'tool', days_inactive: 90, threshold_days: 60, last_activity_at: null, grace_period_ends_at: null }];
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchInactiveNhis } = await import('./nhi-governance-client');

			const result = await fetchInactiveNhis(mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/governance/inactivity');
			expect(result).toHaveLength(1);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchInactiveNhis } = await import('./nhi-governance-client');

			await expect(fetchInactiveNhis(mockFetch)).rejects.toThrow('Failed to fetch staleness report: 500');
		});
	});

	describe('grantGracePeriodClient', () => {
		it('sends POST to /api/nhi/governance/inactivity/grace-period/:id', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { grantGracePeriodClient } = await import('./nhi-governance-client');

			await grantGracePeriodClient('nhi-1', 30, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/governance/inactivity/grace-period/nhi-1', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ grace_days: 30 })
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { grantGracePeriodClient } = await import('./nhi-governance-client');

			await expect(grantGracePeriodClient('bad', 30, mockFetch)).rejects.toThrow('Failed to grant grace period: 400');
		});
	});

	describe('triggerAutoSuspend', () => {
		it('sends POST to /api/nhi/governance/inactivity/auto-suspend', async () => {
			const data = { suspended: ['nhi-1'], failed: [] };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { triggerAutoSuspend } = await import('./nhi-governance-client');

			const result = await triggerAutoSuspend(mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/governance/inactivity/auto-suspend', { method: 'POST' });
			expect(result.suspended).toEqual(['nhi-1']);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { triggerAutoSuspend } = await import('./nhi-governance-client');

			await expect(triggerAutoSuspend(mockFetch)).rejects.toThrow('Failed to auto-suspend: 500');
		});
	});

	// --- Orphans ---

	describe('fetchOrphanNhis', () => {
		it('fetches from /api/nhi/governance/orphans', async () => {
			const data = [{ id: 'nhi-2', name: 'Orphan', nhi_type: 'agent', owner_id: null, reason: 'Owner does not exist' }];
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchOrphanNhis } = await import('./nhi-governance-client');

			const result = await fetchOrphanNhis(mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/governance/orphans');
			expect(result).toHaveLength(1);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchOrphanNhis } = await import('./nhi-governance-client');

			await expect(fetchOrphanNhis(mockFetch)).rejects.toThrow('Failed to fetch orphan detections: 500');
		});
	});

	// --- SoD Rules ---

	describe('fetchNhiSodRules', () => {
		it('fetches from /api/nhi/governance/sod/rules', async () => {
			const data = { data: [], limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchNhiSodRules } = await import('./nhi-governance-client');

			const result = await fetchNhiSodRules({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/governance/sod/rules');
			expect(result).toEqual(data);
		});

		it('includes pagination params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ data: [], limit: 10, offset: 20 }));
			const { fetchNhiSodRules } = await import('./nhi-governance-client');

			await fetchNhiSodRules({ limit: 10, offset: 20 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=20');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchNhiSodRules } = await import('./nhi-governance-client');

			await expect(fetchNhiSodRules({}, mockFetch)).rejects.toThrow('Failed to fetch NHI SoD rules: 500');
		});
	});

	describe('deleteNhiSodRuleClient', () => {
		it('sends DELETE to /api/nhi/governance/sod/rules/:id', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { deleteNhiSodRuleClient } = await import('./nhi-governance-client');

			await deleteNhiSodRuleClient('rule-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/governance/sod/rules/rule-1', { method: 'DELETE' });
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { deleteNhiSodRuleClient } = await import('./nhi-governance-client');

			await expect(deleteNhiSodRuleClient('bad', mockFetch)).rejects.toThrow('Failed to delete NHI SoD rule: 404');
		});
	});

	describe('checkNhiSodClient', () => {
		it('sends POST to /api/nhi/governance/sod/check', async () => {
			const data = { violations: [], is_allowed: true };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { checkNhiSodClient } = await import('./nhi-governance-client');

			const result = await checkNhiSodClient('agent-1', 'tool-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/governance/sod/check', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ agent_id: 'agent-1', tool_id: 'tool-1' })
			});
			expect(result.is_allowed).toBe(true);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { checkNhiSodClient } = await import('./nhi-governance-client');

			await expect(checkNhiSodClient('a', 't', mockFetch)).rejects.toThrow('Failed to check NHI SoD: 500');
		});
	});

	// --- Certifications ---

	describe('fetchNhiCertCampaigns', () => {
		it('fetches from /api/nhi/governance/certifications', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse([]));
			const { fetchNhiCertCampaigns } = await import('./nhi-governance-client');

			const result = await fetchNhiCertCampaigns({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/governance/certifications');
			expect(result).toEqual([]);
		});

		it('includes status filter', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse([]));
			const { fetchNhiCertCampaigns } = await import('./nhi-governance-client');

			await fetchNhiCertCampaigns({ status: 'active' }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('status=active');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchNhiCertCampaigns } = await import('./nhi-governance-client');

			await expect(fetchNhiCertCampaigns({}, mockFetch)).rejects.toThrow('Failed to fetch NHI cert campaigns: 500');
		});
	});

	describe('certifyNhiClient', () => {
		it('sends POST to certify endpoint', async () => {
			const data = { nhi_id: 'nhi-1', certified_by: 'admin', certified_at: '2026-01-01', next_certification_at: null };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { certifyNhiClient } = await import('./nhi-governance-client');

			const result = await certifyNhiClient('camp-1', 'nhi-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/governance/certifications/camp-1/certify/nhi-1', { method: 'POST' });
			expect(result.nhi_id).toBe('nhi-1');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { certifyNhiClient } = await import('./nhi-governance-client');

			await expect(certifyNhiClient('c', 'n', mockFetch)).rejects.toThrow('Failed to certify NHI: 400');
		});
	});

	describe('revokeNhiCertClient', () => {
		it('sends POST to revoke endpoint', async () => {
			const data = { nhi_id: 'nhi-1', revoked: true, new_state: 'suspended' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { revokeNhiCertClient } = await import('./nhi-governance-client');

			const result = await revokeNhiCertClient('camp-1', 'nhi-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/governance/certifications/camp-1/revoke/nhi-1', { method: 'POST' });
			expect(result.revoked).toBe(true);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { revokeNhiCertClient } = await import('./nhi-governance-client');

			await expect(revokeNhiCertClient('c', 'n', mockFetch)).rejects.toThrow('Failed to revoke NHI cert: 400');
		});
	});
});
