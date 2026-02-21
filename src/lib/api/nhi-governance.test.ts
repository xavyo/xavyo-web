import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	getNhiRisk,
	getNhiRiskSummary,
	getStalenessReport,
	grantGracePeriod,
	autoSuspendExpired,
	listOrphanDetections,
	createNhiSodRule,
	listNhiSodRules,
	deleteNhiSodRule,
	checkNhiSod,
	createNhiCertCampaign,
	listNhiCertCampaigns,
	getNhiCertCampaign,
	decideNhiCertItem
} from './nhi-governance';

vi.mock('./client', () => ({
	apiClient: vi.fn(),
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

import { apiClient } from './client';

const mockApiClient = vi.mocked(apiClient);

describe('NHI Governance API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- Risk ---

	describe('getNhiRisk', () => {
		it('calls GET /nhi/:id/risk', async () => {
			const mockResponse = { nhi_id: 'nhi-1', total_score: 45, risk_level: 'medium', common_factors: [], type_specific_factors: [] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getNhiRisk('nhi-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/nhi-1/risk', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getNhiRiskSummary', () => {
		it('calls GET /nhi/risk-summary', async () => {
			const mockResponse = { total_count: 10, by_type: { service_account: 5, ai_agent: 5 }, by_risk_level: { critical: 0, high: 1, medium: 4, low: 5 } };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getNhiRiskSummary(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/risk-summary', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Staleness ---

	describe('getStalenessReport', () => {
		it('calls GET /nhi/staleness-report', async () => {
			const mockResponse = { generated_at: '2026-01-15', min_inactive_days: 30, total_stale: 2, critical_count: 1, warning_count: 1, stale_nhis: [] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getStalenessReport(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/staleness-report', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result.total_stale).toBe(2);
		});

		it('passes min_inactive_days query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await getStalenessReport(token, tenantId, mockFetch, 60);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/staleness-report?min_inactive_days=60', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
		});
	});

	describe('grantGracePeriod', () => {
		it('calls POST /governance/nhis/:id/grace-period', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await grantGracePeriod('nhi-1', 30, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/nhi-1/grace-period', {
				method: 'POST', token, tenantId, body: { grace_days: 30 }, fetch: mockFetch
			});
		});
	});

	describe('autoSuspendExpired', () => {
		it('calls POST /governance/nhis/auto-suspend', async () => {
			const mockResponse = { suspended: ['nhi-1'], failed: [] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await autoSuspendExpired(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/nhis/auto-suspend', {
				method: 'POST', token, tenantId, fetch: mockFetch
			});
			expect(result.suspended).toEqual(['nhi-1']);
		});
	});

	// --- Orphans ---

	describe('listOrphanDetections', () => {
		it('calls GET /governance/orphan-detections', async () => {
			const mockResponse = { items: [{ id: 'det-1' }], total: 1, limit: 50, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listOrphanDetections(token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/governance/orphan-detections');
			expect(result.items).toHaveLength(1);
		});
	});

	// --- SoD Rules ---

	describe('createNhiSodRule', () => {
		it('calls POST /governance/sod-rules with body', async () => {
			const body = { tool_id_a: 'tool-1', tool_id_b: 'tool-2', enforcement: 'prevent' as const };
			const mockResponse = { id: 'rule-1', tenant_id: 'test-tenant', ...body, description: null, created_at: '2026-01-01', created_by: null };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createNhiSodRule(body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/sod-rules', {
				method: 'POST', token, tenantId, body, fetch: mockFetch
			});
			expect(result.id).toBe('rule-1');
		});
	});

	describe('listNhiSodRules', () => {
		it('calls GET /governance/sod-rules with pagination', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listNhiSodRules({ limit: 20, offset: 0 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/governance/sod-rules');
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteNhiSodRule', () => {
		it('calls DELETE /governance/sod-rules/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteNhiSodRule('rule-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/sod-rules/rule-1', {
				method: 'DELETE', token, tenantId, fetch: mockFetch
			});
		});
	});

	describe('checkNhiSod', () => {
		it('calls POST /governance/sod-check with body', async () => {
			const body = { agent_id: 'agent-1', tool_id: 'tool-1' };
			const mockResponse = { violations: [], is_allowed: true };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await checkNhiSod(body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/sod-check', {
				method: 'POST', token, tenantId, body, fetch: mockFetch
			});
			expect(result.is_allowed).toBe(true);
		});
	});

	// --- Certifications ---

	describe('createNhiCertCampaign', () => {
		it('calls POST /nhi/certifications with body', async () => {
			const body = { name: 'Q1 Cert' };
			const mockResponse = { id: 'camp-1', tenant_id: 'test-tenant', name: 'Q1 Cert', description: null, scope: 'all', nhi_type_filter: null, specific_nhi_ids: null, status: 'active', due_date: null, created_by: null, created_at: '2026-01-01', updated_at: '2026-01-01' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createNhiCertCampaign(body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/certifications', {
				method: 'POST', token, tenantId, body, fetch: mockFetch
			});
			expect(result.id).toBe('camp-1');
		});
	});

	describe('listNhiCertCampaigns', () => {
		it('calls GET /nhi/certifications', async () => {
			mockApiClient.mockResolvedValue([]);

			const result = await listNhiCertCampaigns({}, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/nhi/certifications');
			expect(result).toEqual([]);
		});

		it('includes status filter in query string', async () => {
			mockApiClient.mockResolvedValue([]);

			await listNhiCertCampaigns({ status: 'active' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('status=active');
		});
	});

	describe('getNhiCertCampaign', () => {
		it('calls GET /nhi/certifications/:id', async () => {
			const mockResponse = { id: 'camp-1', name: 'Q1 Cert', status: 'active' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getNhiCertCampaign('camp-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/certifications/camp-1', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result.id).toBe('camp-1');
		});
	});

	describe('decideNhiCertItem', () => {
		it('calls POST /nhi/certifications/items/:itemId/decide with certify', async () => {
			const mockResponse = { id: 'item-1', campaign_id: 'camp-1', nhi_id: 'nhi-1', decision: 'certify' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await decideNhiCertItem('item-1', 'certify', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/certifications/items/item-1/decide', {
				method: 'POST', token, tenantId, body: { decision: 'certify' }, fetch: mockFetch
			});
			expect(result.decision).toBe('certify');
		});

		it('calls POST /nhi/certifications/items/:itemId/decide with revoke', async () => {
			const mockResponse = { id: 'item-1', campaign_id: 'camp-1', nhi_id: 'nhi-1', decision: 'revoke' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await decideNhiCertItem('item-1', 'revoke', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/certifications/items/item-1/decide', {
				method: 'POST', token, tenantId, body: { decision: 'revoke' }, fetch: mockFetch
			});
			expect(result.decision).toBe('revoke');
		});
	});
});
