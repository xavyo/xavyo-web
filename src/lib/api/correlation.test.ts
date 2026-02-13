import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listCorrelationRules,
	getCorrelationRule,
	createCorrelationRule,
	updateCorrelationRule,
	deleteCorrelationRule,
	validateExpression,
	getCorrelationThresholds,
	upsertCorrelationThresholds,
	triggerCorrelation,
	getCorrelationJobStatus,
	getCorrelationStatistics,
	getCorrelationTrends,
	listCorrelationCases,
	getCorrelationCase,
	confirmCorrelationCase,
	rejectCorrelationCase,
	createIdentityFromCase,
	reassignCorrelationCase,
	listIdentityCorrelationRules,
	getIdentityCorrelationRule,
	createIdentityCorrelationRule,
	updateIdentityCorrelationRule,
	deleteIdentityCorrelationRule,
	listCorrelationAuditEvents,
	getCorrelationAuditEvent
} from './correlation';

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

describe('Correlation API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';
	const connectorId = 'conn-1';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- Connector-Scoped Correlation Rules ---

	describe('listCorrelationRules', () => {
		it('calls GET /governance/connectors/:connectorId/correlation/rules', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listCorrelationRules(connectorId, {}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/connectors/conn-1/correlation/rules',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes match_type query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCorrelationRules(connectorId, { match_type: 'exact' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('match_type=exact');
		});

		it('includes is_active query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCorrelationRules(connectorId, { is_active: true }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('is_active=true');
		});

		it('includes tier query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCorrelationRules(connectorId, { tier: 1 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('tier=1');
		});

		it('includes limit and offset query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCorrelationRules(connectorId, { limit: 10, offset: 20 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=10');
			expect(calledPath).toContain('offset=20');
		});
	});

	describe('getCorrelationRule', () => {
		it('calls GET /governance/connectors/:connectorId/correlation/rules/:ruleId', async () => {
			const mockResponse = { id: 'rule-1', connector_id: connectorId, name: 'Email Match', match_type: 'exact' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getCorrelationRule(connectorId, 'rule-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/connectors/conn-1/correlation/rules/rule-1',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('createCorrelationRule', () => {
		it('calls POST /governance/connectors/:connectorId/correlation/rules with body', async () => {
			const body = { name: 'Email Match', match_type: 'exact', source_attribute: 'email', target_attribute: 'email' };
			const mockResponse = { id: 'rule-1', ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createCorrelationRule(connectorId, body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/connectors/conn-1/correlation/rules',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateCorrelationRule', () => {
		it('calls PATCH /governance/connectors/:connectorId/correlation/rules/:ruleId with body', async () => {
			const body = { name: 'Updated Name' };
			const mockResponse = { id: 'rule-1', name: 'Updated Name' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updateCorrelationRule(connectorId, 'rule-1', body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/connectors/conn-1/correlation/rules/rule-1',
				{ method: 'PATCH', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteCorrelationRule', () => {
		it('calls DELETE /governance/connectors/:connectorId/correlation/rules/:ruleId', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteCorrelationRule(connectorId, 'rule-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/connectors/conn-1/correlation/rules/rule-1',
				{ method: 'DELETE', token, tenantId, fetch: mockFetch }
			);
		});
	});

	describe('validateExpression', () => {
		it('calls POST /governance/connectors/:connectorId/correlation/rules/validate-expression with body', async () => {
			const body = { expression: 'LOWER(source.email) == LOWER(target.email)' };
			const mockResponse = { valid: true, errors: [] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await validateExpression(connectorId, body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/connectors/conn-1/correlation/rules/validate-expression',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Thresholds ---

	describe('getCorrelationThresholds', () => {
		it('calls GET /governance/connectors/:connectorId/correlation/thresholds', async () => {
			const mockResponse = { connector_id: connectorId, auto_confirm_threshold: 90, auto_reject_threshold: 10 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getCorrelationThresholds(connectorId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/connectors/conn-1/correlation/thresholds',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('upsertCorrelationThresholds', () => {
		it('calls PUT /governance/connectors/:connectorId/correlation/thresholds with body', async () => {
			const body = { auto_confirm_threshold: 95, auto_reject_threshold: 5 };
			const mockResponse = { connector_id: connectorId, ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await upsertCorrelationThresholds(connectorId, body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/connectors/conn-1/correlation/thresholds',
				{ method: 'PUT', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Jobs ---

	describe('triggerCorrelation', () => {
		it('calls POST /governance/connectors/:connectorId/correlation/evaluate with body', async () => {
			const body = { rule_ids: ['rule-1'] };
			const mockResponse = { id: 'job-1', status: 'pending', connector_id: connectorId };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await triggerCorrelation(connectorId, body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/connectors/conn-1/correlation/evaluate',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('sends empty object when body is undefined', async () => {
			const mockResponse = { id: 'job-1', status: 'pending', connector_id: connectorId };
			mockApiClient.mockResolvedValue(mockResponse);

			await triggerCorrelation(connectorId, undefined, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/connectors/conn-1/correlation/evaluate',
				{ method: 'POST', body: {}, token, tenantId, fetch: mockFetch }
			);
		});
	});

	describe('getCorrelationJobStatus', () => {
		it('calls GET /governance/connectors/:connectorId/correlation/jobs/:jobId', async () => {
			const mockResponse = { id: 'job-1', status: 'completed', connector_id: connectorId };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getCorrelationJobStatus(connectorId, 'job-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/connectors/conn-1/correlation/jobs/job-1',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Statistics ---

	describe('getCorrelationStatistics', () => {
		it('calls GET /governance/connectors/:connectorId/correlation/statistics', async () => {
			const mockResponse = { total_rules: 5, total_cases: 10, confirmed: 7, rejected: 3 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getCorrelationStatistics(connectorId, {}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/connectors/conn-1/correlation/statistics',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes start_date and end_date query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await getCorrelationStatistics(
				connectorId,
				{ start_date: '2026-01-01', end_date: '2026-01-31' },
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('start_date=2026-01-01');
			expect(calledPath).toContain('end_date=2026-01-31');
		});
	});

	describe('getCorrelationTrends', () => {
		it('calls GET /governance/connectors/:connectorId/correlation/statistics/trends with date params', async () => {
			const mockResponse = { data_points: [], period: 'daily' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getCorrelationTrends(
				connectorId,
				{ start_date: '2026-01-01', end_date: '2026-01-31' },
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/governance/connectors/conn-1/correlation/statistics/trends');
			expect(calledPath).toContain('start_date=2026-01-01');
			expect(calledPath).toContain('end_date=2026-01-31');
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Cases (Global) ---

	describe('listCorrelationCases', () => {
		it('calls GET /governance/correlation/cases', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listCorrelationCases({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/correlation/cases',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes status query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCorrelationCases({ status: 'pending' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('status=pending');
		});

		it('includes connector_id query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCorrelationCases({ connector_id: 'conn-1' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('connector_id=conn-1');
		});

		it('includes assigned_to query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCorrelationCases({ assigned_to: 'user-1' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('assigned_to=user-1');
		});

		it('includes trigger_type query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCorrelationCases({ trigger_type: 'automatic' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('trigger_type=automatic');
		});

		it('includes date range query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCorrelationCases(
				{ start_date: '2026-01-01', end_date: '2026-01-31' },
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('start_date=2026-01-01');
			expect(calledPath).toContain('end_date=2026-01-31');
		});

		it('includes sort and pagination query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCorrelationCases(
				{ sort_by: 'created_at', sort_order: 'desc', limit: 10, offset: 5 },
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('sort_by=created_at');
			expect(calledPath).toContain('sort_order=desc');
			expect(calledPath).toContain('limit=10');
			expect(calledPath).toContain('offset=5');
		});
	});

	describe('getCorrelationCase', () => {
		it('calls GET /governance/correlation/cases/:caseId', async () => {
			const mockResponse = { id: 'case-1', status: 'pending', confidence_score: 85 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getCorrelationCase('case-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/correlation/cases/case-1',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('confirmCorrelationCase', () => {
		it('calls POST /governance/correlation/cases/:caseId/confirm with body', async () => {
			const body = { merge_strategy: 'keep_source', notes: 'Confirmed match' };
			const mockResponse = { id: 'case-1', status: 'confirmed' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await confirmCorrelationCase('case-1', body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/correlation/cases/case-1/confirm',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('rejectCorrelationCase', () => {
		it('calls POST /governance/correlation/cases/:caseId/reject with body', async () => {
			const body = { reason: 'False positive' };
			const mockResponse = { id: 'case-1', status: 'rejected' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await rejectCorrelationCase('case-1', body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/correlation/cases/case-1/reject',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('createIdentityFromCase', () => {
		it('calls POST /governance/correlation/cases/:caseId/create-identity with body', async () => {
			const body = { display_name: 'John Doe', email: 'john@example.com' };
			const mockResponse = { id: 'case-1', status: 'identity_created' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createIdentityFromCase('case-1', body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/correlation/cases/case-1/create-identity',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('reassignCorrelationCase', () => {
		it('calls POST /governance/correlation/cases/:caseId/reassign with body', async () => {
			const body = { assigned_to: 'user-2', notes: 'Reassigning for review' };
			const mockResponse = { id: 'case-1', assigned_to: 'user-2' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await reassignCorrelationCase('case-1', body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/correlation/cases/case-1/reassign',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Identity Correlation Rules (Global) ---

	describe('listIdentityCorrelationRules', () => {
		it('calls GET /governance/identity-correlation-rules', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listIdentityCorrelationRules({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/identity-correlation-rules',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes match_type query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listIdentityCorrelationRules({ match_type: 'fuzzy' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('match_type=fuzzy');
		});

		it('includes is_active query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listIdentityCorrelationRules({ is_active: false }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('is_active=false');
		});

		it('includes attribute query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listIdentityCorrelationRules({ attribute: 'email' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('attribute=email');
		});

		it('includes limit and offset query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listIdentityCorrelationRules({ limit: 50, offset: 10 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=50');
			expect(calledPath).toContain('offset=10');
		});
	});

	describe('getIdentityCorrelationRule', () => {
		it('calls GET /governance/identity-correlation-rules/:ruleId', async () => {
			const mockResponse = { id: 'icr-1', name: 'Email Identity Rule', match_type: 'exact' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getIdentityCorrelationRule('icr-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/identity-correlation-rules/icr-1',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('createIdentityCorrelationRule', () => {
		it('calls POST /governance/identity-correlation-rules with body', async () => {
			const body = { name: 'Email Rule', match_type: 'exact', source_attribute: 'email', target_attribute: 'email' };
			const mockResponse = { id: 'icr-1', ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createIdentityCorrelationRule(body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/identity-correlation-rules',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateIdentityCorrelationRule', () => {
		it('calls PUT /governance/identity-correlation-rules/:ruleId with body', async () => {
			const body = { name: 'Updated Identity Rule', is_active: false };
			const mockResponse = { id: 'icr-1', ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updateIdentityCorrelationRule('icr-1', body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/identity-correlation-rules/icr-1',
				{ method: 'PUT', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteIdentityCorrelationRule', () => {
		it('calls DELETE /governance/identity-correlation-rules/:ruleId', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteIdentityCorrelationRule('icr-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/identity-correlation-rules/icr-1',
				{ method: 'DELETE', token, tenantId, fetch: mockFetch }
			);
		});
	});

	// --- Audit (Global) ---

	describe('listCorrelationAuditEvents', () => {
		it('calls GET /governance/correlation/audit', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listCorrelationAuditEvents({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/correlation/audit',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes connector_id query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCorrelationAuditEvents({ connector_id: 'conn-1' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('connector_id=conn-1');
		});

		it('includes event_type query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCorrelationAuditEvents({ event_type: 'case_confirmed' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('event_type=case_confirmed');
		});

		it('includes outcome query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCorrelationAuditEvents({ outcome: 'success' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('outcome=success');
		});

		it('includes date range query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCorrelationAuditEvents(
				{ start_date: '2026-01-01', end_date: '2026-01-31' },
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('start_date=2026-01-01');
			expect(calledPath).toContain('end_date=2026-01-31');
		});

		it('includes actor_id query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCorrelationAuditEvents({ actor_id: 'user-1' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('actor_id=user-1');
		});

		it('includes limit and offset query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listCorrelationAuditEvents({ limit: 25, offset: 50 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=25');
			expect(calledPath).toContain('offset=50');
		});
	});

	describe('getCorrelationAuditEvent', () => {
		it('calls GET /governance/correlation/audit/:eventId', async () => {
			const mockResponse = { id: 'evt-1', event_type: 'case_confirmed', outcome: 'success', actor_id: 'user-1', created_at: '2026-01-15T10:00:00Z' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getCorrelationAuditEvent('evt-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/correlation/audit/evt-1',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Error handling ---

	describe('error handling', () => {
		it('propagates errors from apiClient for GET requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Network error'));

			await expect(getCorrelationRule(connectorId, 'rule-1', token, tenantId, mockFetch)).rejects.toThrow('Network error');
		});

		it('propagates errors from apiClient for POST requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Server error'));

			await expect(
				createCorrelationRule(connectorId, {} as any, token, tenantId, mockFetch)
			).rejects.toThrow('Server error');
		});

		it('propagates errors from apiClient for PATCH requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Not found'));

			await expect(
				updateCorrelationRule(connectorId, 'rule-1', {} as any, token, tenantId, mockFetch)
			).rejects.toThrow('Not found');
		});

		it('propagates errors from apiClient for PUT requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Validation error'));

			await expect(
				upsertCorrelationThresholds(connectorId, {} as any, token, tenantId, mockFetch)
			).rejects.toThrow('Validation error');
		});

		it('propagates errors from apiClient for DELETE requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Forbidden'));

			await expect(
				deleteCorrelationRule(connectorId, 'rule-1', token, tenantId, mockFetch)
			).rejects.toThrow('Forbidden');
		});

		it('propagates errors from apiClient for case actions', async () => {
			mockApiClient.mockRejectedValue(new Error('Case not found'));

			await expect(
				confirmCorrelationCase('case-1', {} as any, token, tenantId, mockFetch)
			).rejects.toThrow('Case not found');
		});

		it('propagates errors from apiClient for identity correlation rules', async () => {
			mockApiClient.mockRejectedValue(new Error('Unauthorized'));

			await expect(
				listIdentityCorrelationRules({}, token, tenantId, mockFetch)
			).rejects.toThrow('Unauthorized');
		});

		it('propagates errors from apiClient for audit events', async () => {
			mockApiClient.mockRejectedValue(new Error('Service unavailable'));

			await expect(
				listCorrelationAuditEvents({}, token, tenantId, mockFetch)
			).rejects.toThrow('Service unavailable');
		});
	});
});
