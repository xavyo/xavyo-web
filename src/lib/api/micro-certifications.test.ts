import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listMicroCertifications,
	getMyPendingCertifications,
	getMicroCertification,
	decideMicroCertification,
	delegateMicroCertification,
	skipMicroCertification,
	bulkDecideMicroCertifications,
	getMicroCertificationStats,
	getMicroCertificationEvents,
	searchCertificationEvents,
	manualTriggerCertification,
	listTriggerRules,
	getTriggerRule,
	createTriggerRule,
	updateTriggerRule,
	deleteTriggerRule,
	enableTriggerRule,
	disableTriggerRule,
	setDefaultTriggerRule
} from './micro-certifications';

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

describe('Micro Certifications API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';
	const certId = '00000000-0000-0000-0000-000000000001';
	const ruleId = '00000000-0000-0000-0000-000000000002';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- Micro Certifications ---

	describe('listMicroCertifications', () => {
		it('calls GET /governance/micro-certifications with no query params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listMicroCertifications({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/micro-certifications',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes status query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listMicroCertifications({ status: 'pending' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('status=pending');
		});

		it('includes user_id query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listMicroCertifications({ user_id: 'user-1' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('user_id=user-1');
		});

		it('includes reviewer_id query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listMicroCertifications({ reviewer_id: 'reviewer-1' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('reviewer_id=reviewer-1');
		});

		it('includes entitlement_id query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listMicroCertifications({ entitlement_id: 'ent-1' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('entitlement_id=ent-1');
		});

		it('includes escalated query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listMicroCertifications({ escalated: true }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('escalated=true');
		});

		it('includes past_deadline query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listMicroCertifications({ past_deadline: false }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('past_deadline=false');
		});

		it('includes limit and offset query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listMicroCertifications({ limit: 10, offset: 5 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=10');
			expect(calledPath).toContain('offset=5');
		});
	});

	describe('getMyPendingCertifications', () => {
		it('calls GET /governance/micro-certifications/my-pending with no query params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getMyPendingCertifications({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/micro-certifications/my-pending',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes limit and offset query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await getMyPendingCertifications({ limit: 25, offset: 10 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=25');
			expect(calledPath).toContain('offset=10');
		});
	});

	describe('getMicroCertification', () => {
		it('calls GET /governance/micro-certifications/:id', async () => {
			const mockResponse = { id: certId, status: 'pending', user_id: 'user-1' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getMicroCertification(certId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/micro-certifications/${certId}`,
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('decideMicroCertification', () => {
		it('calls POST /governance/micro-certifications/:id/decide with body', async () => {
			const body = { decision: 'approve', justification: 'Access is appropriate' };
			const mockResponse = { id: certId, status: 'approved' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await decideMicroCertification(certId, body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/micro-certifications/${certId}/decide`,
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('passes revoke decision body', async () => {
			const body = { decision: 'revoke', justification: 'No longer needed' };
			mockApiClient.mockResolvedValue({} as any);

			await decideMicroCertification(certId, body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/micro-certifications/${certId}/decide`,
				expect.objectContaining({ method: 'POST', body })
			);
		});
	});

	describe('delegateMicroCertification', () => {
		it('calls POST /governance/micro-certifications/:id/delegate with body', async () => {
			const body = { delegate_to: 'user-2', reason: 'Manager is better suited' };
			const mockResponse = { id: certId, status: 'pending' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await delegateMicroCertification(certId, body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/micro-certifications/${certId}/delegate`,
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('skipMicroCertification', () => {
		it('calls POST /governance/micro-certifications/:id/skip with body', async () => {
			const body = { reason: 'User on leave' };
			const mockResponse = { id: certId, status: 'skipped' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await skipMicroCertification(certId, body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/micro-certifications/${certId}/skip`,
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('bulkDecideMicroCertifications', () => {
		it('calls POST /governance/micro-certifications/bulk-decide with body', async () => {
			const body = {
				certification_ids: [certId, '00000000-0000-0000-0000-000000000003'],
				decision: 'approve',
				justification: 'Bulk approval'
			};
			const mockResponse = { processed: 2, succeeded: 2, failed: 0, errors: [] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await bulkDecideMicroCertifications(body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/micro-certifications/bulk-decide',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getMicroCertificationStats', () => {
		it('calls GET /governance/micro-certifications/stats', async () => {
			const mockResponse = {
				total: 100,
				pending: 30,
				approved: 50,
				revoked: 10,
				auto_revoked: 0,
				flagged_for_review: 0,
				expired: 0,
				skipped: 5,
				escalated: 0,
				past_deadline: 0,
				by_trigger_type: null
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getMicroCertificationStats(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/micro-certifications/stats',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getMicroCertificationEvents', () => {
		it('calls GET /governance/micro-certifications/:id/events', async () => {
			const mockResponse = { items: [], total: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getMicroCertificationEvents(certId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/micro-certifications/${certId}/events`,
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('searchCertificationEvents', () => {
		it('calls GET /governance/micro-cert-events with no query params', async () => {
			const mockResponse = { items: [], total: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await searchCertificationEvents({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/micro-cert-events',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes event_type query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await searchCertificationEvents({ event_type: 'approved' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('event_type=approved');
		});

		it('includes actor_id query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await searchCertificationEvents({ actor_id: 'user-1' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('actor_id=user-1');
		});

		it('includes certification_id query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await searchCertificationEvents({ certification_id: certId }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain(`certification_id=${certId}`);
		});

		it('includes date range query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await searchCertificationEvents(
				{ from_date: '2026-01-01', to_date: '2026-01-31' },
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('from_date=2026-01-01');
			expect(calledPath).toContain('to_date=2026-01-31');
		});

		it('includes limit and offset query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await searchCertificationEvents({ limit: 50, offset: 100 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=50');
			expect(calledPath).toContain('offset=100');
		});
	});

	describe('manualTriggerCertification', () => {
		it('calls POST /governance/micro-certifications/trigger with body', async () => {
			const body = { user_id: 'user-1', entitlement_id: 'ent-1', reason: 'Manual review needed' };
			const mockResponse = { id: certId, status: 'pending' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await manualTriggerCertification(body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/micro-certifications/trigger',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Trigger Rules ---

	describe('listTriggerRules', () => {
		it('calls GET /governance/micro-cert-triggers with no query params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listTriggerRules({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/micro-cert-triggers',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes trigger_type query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listTriggerRules({ trigger_type: 'high_risk_assignment' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('trigger_type=high_risk_assignment');
		});

		it('includes scope_type query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listTriggerRules({ scope_type: 'entitlement' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('scope_type=entitlement');
		});

		it('includes is_active query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listTriggerRules({ is_active: true }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('is_active=true');
		});

		it('includes limit and offset query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listTriggerRules({ limit: 10, offset: 20 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=10');
			expect(calledPath).toContain('offset=20');
		});
	});

	describe('getTriggerRule', () => {
		it('calls GET /governance/micro-cert-triggers/:id', async () => {
			const mockResponse = { id: ruleId, name: 'High Risk Assignment Trigger', trigger_type: 'high_risk_assignment' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getTriggerRule(ruleId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/micro-cert-triggers/${ruleId}`,
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('createTriggerRule', () => {
		it('calls POST /governance/micro-cert-triggers with body', async () => {
			const body = {
				name: 'New Entitlement Trigger',
				trigger_type: 'entitlement_grant',
				scope_type: 'entitlement',
				is_active: true
			};
			const mockResponse = { id: ruleId, ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createTriggerRule(body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/micro-cert-triggers',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateTriggerRule', () => {
		it('calls PUT /governance/micro-cert-triggers/:id with body', async () => {
			const body = { name: 'Updated Trigger', is_active: false };
			const mockResponse = { id: ruleId, ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updateTriggerRule(ruleId, body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/micro-cert-triggers/${ruleId}`,
				{ method: 'PUT', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteTriggerRule', () => {
		it('calls DELETE /governance/micro-cert-triggers/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteTriggerRule(ruleId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/micro-cert-triggers/${ruleId}`,
				{ method: 'DELETE', token, tenantId, fetch: mockFetch }
			);
		});
	});

	describe('enableTriggerRule', () => {
		it('calls POST /governance/micro-cert-triggers/:id/enable', async () => {
			const mockResponse = { id: ruleId, is_active: true };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await enableTriggerRule(ruleId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/micro-cert-triggers/${ruleId}/enable`,
				{ method: 'POST', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('disableTriggerRule', () => {
		it('calls POST /governance/micro-cert-triggers/:id/disable', async () => {
			const mockResponse = { id: ruleId, is_active: false };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await disableTriggerRule(ruleId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/micro-cert-triggers/${ruleId}/disable`,
				{ method: 'POST', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('setDefaultTriggerRule', () => {
		it('calls POST /governance/micro-cert-triggers/:id/set-default', async () => {
			const mockResponse = { id: ruleId, is_default: true };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await setDefaultTriggerRule(ruleId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/micro-cert-triggers/${ruleId}/set-default`,
				{ method: 'POST', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Error handling ---

	describe('error handling', () => {
		it('propagates errors from apiClient for list requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Network error'));

			await expect(
				listMicroCertifications({}, token, tenantId, mockFetch)
			).rejects.toThrow('Network error');
		});

		it('propagates errors from apiClient for GET requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Not found'));

			await expect(
				getMicroCertification(certId, token, tenantId, mockFetch)
			).rejects.toThrow('Not found');
		});

		it('propagates errors from apiClient for POST requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Server error'));

			await expect(
				decideMicroCertification(certId, {} as any, token, tenantId, mockFetch)
			).rejects.toThrow('Server error');
		});

		it('propagates errors from apiClient for PUT requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Validation error'));

			await expect(
				updateTriggerRule(ruleId, {} as any, token, tenantId, mockFetch)
			).rejects.toThrow('Validation error');
		});

		it('propagates errors from apiClient for DELETE requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Forbidden'));

			await expect(
				deleteTriggerRule(ruleId, token, tenantId, mockFetch)
			).rejects.toThrow('Forbidden');
		});

		it('propagates errors from apiClient for bulk operations', async () => {
			mockApiClient.mockRejectedValue(new Error('Timeout'));

			await expect(
				bulkDecideMicroCertifications({} as any, token, tenantId, mockFetch)
			).rejects.toThrow('Timeout');
		});

		it('propagates errors from apiClient for trigger rule lifecycle', async () => {
			mockApiClient.mockRejectedValue(new Error('Unauthorized'));

			await expect(
				enableTriggerRule(ruleId, token, tenantId, mockFetch)
			).rejects.toThrow('Unauthorized');
		});
	});
});
