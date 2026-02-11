import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	getNhiRisk,
	getNhiRiskSummary,
	detectInactiveNhis,
	grantGracePeriod,
	autoSuspendExpired,
	detectOrphanNhis,
	createNhiSodRule,
	listNhiSodRules,
	deleteNhiSodRule,
	checkNhiSod,
	createNhiCertCampaign,
	listNhiCertCampaigns,
	certifyNhi,
	revokeNhiCert
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
			const mockResponse = { total_entities: 10, by_type: [], by_level: [] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getNhiRiskSummary(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/risk-summary', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Inactivity ---

	describe('detectInactiveNhis', () => {
		it('calls GET /nhi/inactivity/detect', async () => {
			const mockResponse = [{ id: 'nhi-1', name: 'Stale Tool', nhi_type: 'tool', days_inactive: 90, threshold_days: 60, last_activity_at: null, grace_period_ends_at: null }];
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await detectInactiveNhis(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/inactivity/detect', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result).toHaveLength(1);
		});
	});

	describe('grantGracePeriod', () => {
		it('calls POST /nhi/inactivity/grace-period/:id with grace_days', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await grantGracePeriod('nhi-1', 30, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/inactivity/grace-period/nhi-1', {
				method: 'POST', token, tenantId, body: { grace_days: 30 }, fetch: mockFetch
			});
		});
	});

	describe('autoSuspendExpired', () => {
		it('calls POST /nhi/inactivity/auto-suspend', async () => {
			const mockResponse = { suspended: ['nhi-1'], failed: [] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await autoSuspendExpired(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/inactivity/auto-suspend', {
				method: 'POST', token, tenantId, fetch: mockFetch
			});
			expect(result.suspended).toEqual(['nhi-1']);
		});
	});

	// --- Orphans ---

	describe('detectOrphanNhis', () => {
		it('calls GET /nhi/orphans/detect', async () => {
			const mockResponse = [{ id: 'nhi-2', name: 'Orphan Agent', nhi_type: 'agent', owner_id: null, reason: 'Owner does not exist' }];
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await detectOrphanNhis(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/orphans/detect', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result).toHaveLength(1);
		});
	});

	// --- SoD Rules ---

	describe('createNhiSodRule', () => {
		it('calls POST /nhi/sod/rules with body', async () => {
			const body = { tool_id_a: 'tool-1', tool_id_b: 'tool-2', enforcement: 'prevent' as const };
			const mockResponse = { id: 'rule-1', tenant_id: 'test-tenant', ...body, description: null, created_at: '2026-01-01', created_by: null };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createNhiSodRule(body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/sod/rules', {
				method: 'POST', token, tenantId, body, fetch: mockFetch
			});
			expect(result.id).toBe('rule-1');
		});
	});

	describe('listNhiSodRules', () => {
		it('calls GET /nhi/sod/rules with pagination', async () => {
			const mockResponse = { data: [], limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listNhiSodRules({ limit: 20, offset: 0 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/nhi/sod/rules');
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteNhiSodRule', () => {
		it('calls DELETE /nhi/sod/rules/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteNhiSodRule('rule-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/sod/rules/rule-1', {
				method: 'DELETE', token, tenantId, fetch: mockFetch
			});
		});
	});

	describe('checkNhiSod', () => {
		it('calls POST /nhi/sod/check with body', async () => {
			const body = { agent_id: 'agent-1', tool_id: 'tool-1' };
			const mockResponse = { violations: [], is_allowed: true };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await checkNhiSod(body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/sod/check', {
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

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/certifications', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual([]);
		});

		it('includes status filter in query string', async () => {
			mockApiClient.mockResolvedValue([]);

			await listNhiCertCampaigns({ status: 'active' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('status=active');
		});
	});

	describe('certifyNhi', () => {
		it('calls POST /nhi/certifications/:campaignId/certify/:nhiId', async () => {
			const mockResponse = { nhi_id: 'nhi-1', certified_by: 'admin', certified_at: '2026-01-01', next_certification_at: null };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await certifyNhi('camp-1', 'nhi-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/certifications/camp-1/certify/nhi-1', {
				method: 'POST', token, tenantId, fetch: mockFetch
			});
			expect(result.nhi_id).toBe('nhi-1');
		});
	});

	describe('revokeNhiCert', () => {
		it('calls POST /nhi/certifications/:campaignId/revoke/:nhiId', async () => {
			const mockResponse = { nhi_id: 'nhi-1', revoked: true, new_state: 'suspended' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await revokeNhiCert('camp-1', 'nhi-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/certifications/camp-1/revoke/nhi-1', {
				method: 'POST', token, tenantId, fetch: mockFetch
			});
			expect(result.revoked).toBe(true);
		});
	});
});
