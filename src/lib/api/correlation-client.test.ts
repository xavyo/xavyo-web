import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('correlation-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	// --- Connector-Scoped Rules ---

	describe('fetchCorrelationRules', () => {
		it('fetches from /api/connectors/:id/correlation/rules', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchCorrelationRules } = await import('./correlation-client');

			const result = await fetchCorrelationRules('conn-1', {}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/connectors/conn-1/correlation/rules');
			expect(result).toEqual(data);
		});

		it('includes query params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0, limit: 10, offset: 20 }));
			const { fetchCorrelationRules } = await import('./correlation-client');

			await fetchCorrelationRules('conn-1', { match_type: 'exact', is_active: true, tier: 1, limit: 10, offset: 20 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('match_type=exact');
			expect(calledUrl).toContain('is_active=true');
			expect(calledUrl).toContain('tier=1');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=20');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchCorrelationRules } = await import('./correlation-client');

			await expect(fetchCorrelationRules('conn-1', {}, mockFetch)).rejects.toThrow('Failed to fetch correlation rules: 500');
		});
	});

	describe('fetchCorrelationRule', () => {
		it('fetches from /api/connectors/:id/correlation/rules/:ruleId', async () => {
			const data = { id: 'rule-1', name: 'Email match', match_type: 'exact' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchCorrelationRule } = await import('./correlation-client');

			const result = await fetchCorrelationRule('conn-1', 'rule-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/connectors/conn-1/correlation/rules/rule-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchCorrelationRule } = await import('./correlation-client');

			await expect(fetchCorrelationRule('conn-1', 'bad', mockFetch)).rejects.toThrow('Failed to fetch correlation rule: 404');
		});
	});

	describe('createCorrelationRuleClient', () => {
		it('sends POST to /api/connectors/:id/correlation/rules', async () => {
			const body = { name: 'Email match', match_type: 'exact', source_attribute: 'email', target_attribute: 'email' };
			const data = { id: 'rule-1', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { createCorrelationRuleClient } = await import('./correlation-client');

			const result = await createCorrelationRuleClient('conn-1', body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/connectors/conn-1/correlation/rules', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createCorrelationRuleClient } = await import('./correlation-client');

			await expect(createCorrelationRuleClient('conn-1', {} as any, mockFetch)).rejects.toThrow('Failed to create correlation rule: 400');
		});
	});

	describe('updateCorrelationRuleClient', () => {
		it('sends PATCH to /api/connectors/:id/correlation/rules/:ruleId', async () => {
			const body = { name: 'Updated rule' };
			const data = { id: 'rule-1', name: 'Updated rule' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { updateCorrelationRuleClient } = await import('./correlation-client');

			const result = await updateCorrelationRuleClient('conn-1', 'rule-1', body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/connectors/conn-1/correlation/rules/rule-1', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 422));
			const { updateCorrelationRuleClient } = await import('./correlation-client');

			await expect(updateCorrelationRuleClient('conn-1', 'rule-1', {} as any, mockFetch)).rejects.toThrow('Failed to update correlation rule: 422');
		});
	});

	describe('deleteCorrelationRuleClient', () => {
		it('sends DELETE to /api/connectors/:id/correlation/rules/:ruleId', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { deleteCorrelationRuleClient } = await import('./correlation-client');

			await deleteCorrelationRuleClient('conn-1', 'rule-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/connectors/conn-1/correlation/rules/rule-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { deleteCorrelationRuleClient } = await import('./correlation-client');

			await expect(deleteCorrelationRuleClient('conn-1', 'bad', mockFetch)).rejects.toThrow('Failed to delete correlation rule: 404');
		});
	});

	describe('validateExpressionClient', () => {
		it('sends POST to /api/connectors/:id/correlation/rules/validate-expression', async () => {
			const body = { expression: 'lower(source.email) == lower(target.email)' };
			const data = { valid: true, errors: [] };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { validateExpressionClient } = await import('./correlation-client');

			const result = await validateExpressionClient('conn-1', body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/connectors/conn-1/correlation/rules/validate-expression', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { validateExpressionClient } = await import('./correlation-client');

			await expect(validateExpressionClient('conn-1', {} as any, mockFetch)).rejects.toThrow('Failed to validate expression: 400');
		});
	});

	// --- Thresholds ---

	describe('fetchCorrelationThresholds', () => {
		it('fetches from /api/connectors/:id/correlation/thresholds', async () => {
			const data = { auto_confirm_threshold: 0.95, review_threshold: 0.7, reject_threshold: 0.3 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchCorrelationThresholds } = await import('./correlation-client');

			const result = await fetchCorrelationThresholds('conn-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/connectors/conn-1/correlation/thresholds');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchCorrelationThresholds } = await import('./correlation-client');

			await expect(fetchCorrelationThresholds('conn-1', mockFetch)).rejects.toThrow('Failed to fetch thresholds: 500');
		});
	});

	describe('upsertCorrelationThresholdsClient', () => {
		it('sends PUT to /api/connectors/:id/correlation/thresholds', async () => {
			const body = { auto_confirm_threshold: 0.9, review_threshold: 0.6, reject_threshold: 0.2 };
			const data = { ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { upsertCorrelationThresholdsClient } = await import('./correlation-client');

			const result = await upsertCorrelationThresholdsClient('conn-1', body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/connectors/conn-1/correlation/thresholds', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 422));
			const { upsertCorrelationThresholdsClient } = await import('./correlation-client');

			await expect(upsertCorrelationThresholdsClient('conn-1', {} as any, mockFetch)).rejects.toThrow('Failed to save thresholds: 422');
		});
	});

	// --- Jobs ---

	describe('triggerCorrelationClient', () => {
		it('sends POST to /api/connectors/:id/correlation/evaluate with body', async () => {
			const body = { rule_ids: ['rule-1'] };
			const data = { id: 'job-1', status: 'running' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { triggerCorrelationClient } = await import('./correlation-client');

			const result = await triggerCorrelationClient('conn-1', body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/connectors/conn-1/correlation/evaluate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('sends empty object when body is undefined', async () => {
			const data = { id: 'job-2', status: 'running' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { triggerCorrelationClient } = await import('./correlation-client');

			await triggerCorrelationClient('conn-1', undefined, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/connectors/conn-1/correlation/evaluate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({})
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { triggerCorrelationClient } = await import('./correlation-client');

			await expect(triggerCorrelationClient('conn-1', undefined, mockFetch)).rejects.toThrow('Failed to trigger correlation: 500');
		});
	});

	describe('fetchCorrelationJobStatus', () => {
		it('fetches from /api/connectors/:id/correlation/jobs/:jobId', async () => {
			const data = { id: 'job-1', status: 'completed', total_processed: 100 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchCorrelationJobStatus } = await import('./correlation-client');

			const result = await fetchCorrelationJobStatus('conn-1', 'job-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/connectors/conn-1/correlation/jobs/job-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchCorrelationJobStatus } = await import('./correlation-client');

			await expect(fetchCorrelationJobStatus('conn-1', 'bad', mockFetch)).rejects.toThrow('Failed to fetch job status: 404');
		});
	});

	// --- Statistics ---

	describe('fetchCorrelationStatistics', () => {
		it('fetches from /api/connectors/:id/correlation/statistics', async () => {
			const data = { total_cases: 50, confirmed: 30, rejected: 10, pending: 10 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchCorrelationStatistics } = await import('./correlation-client');

			const result = await fetchCorrelationStatistics('conn-1', {}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/connectors/conn-1/correlation/statistics');
			expect(result).toEqual(data);
		});

		it('includes date range params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ total_cases: 10 }));
			const { fetchCorrelationStatistics } = await import('./correlation-client');

			await fetchCorrelationStatistics('conn-1', { start_date: '2026-01-01', end_date: '2026-01-31' }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('start_date=2026-01-01');
			expect(calledUrl).toContain('end_date=2026-01-31');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchCorrelationStatistics } = await import('./correlation-client');

			await expect(fetchCorrelationStatistics('conn-1', {}, mockFetch)).rejects.toThrow('Failed to fetch statistics: 500');
		});
	});

	describe('fetchCorrelationTrends', () => {
		it('fetches from /api/connectors/:id/correlation/statistics/trends', async () => {
			const data = { data_points: [{ date: '2026-01-01', count: 5 }] };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchCorrelationTrends } = await import('./correlation-client');

			const result = await fetchCorrelationTrends('conn-1', { start_date: '2026-01-01', end_date: '2026-01-31' }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('/api/connectors/conn-1/correlation/statistics/trends');
			expect(calledUrl).toContain('start_date=2026-01-01');
			expect(calledUrl).toContain('end_date=2026-01-31');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchCorrelationTrends } = await import('./correlation-client');

			await expect(fetchCorrelationTrends('conn-1', { start_date: '2026-01-01', end_date: '2026-01-31' }, mockFetch)).rejects.toThrow('Failed to fetch trends: 500');
		});
	});

	// --- Cases (Global) ---

	describe('fetchCorrelationCases', () => {
		it('fetches from /api/governance/correlation/cases', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchCorrelationCases } = await import('./correlation-client');

			const result = await fetchCorrelationCases({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/correlation/cases');
			expect(result).toEqual(data);
		});

		it('includes all query params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchCorrelationCases } = await import('./correlation-client');

			await fetchCorrelationCases({
				status: 'pending',
				connector_id: 'conn-1',
				assigned_to: 'admin-1',
				trigger_type: 'automatic',
				start_date: '2026-01-01',
				end_date: '2026-01-31',
				sort_by: 'created_at',
				sort_order: 'desc',
				limit: 10,
				offset: 20
			}, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('status=pending');
			expect(calledUrl).toContain('connector_id=conn-1');
			expect(calledUrl).toContain('assigned_to=admin-1');
			expect(calledUrl).toContain('trigger_type=automatic');
			expect(calledUrl).toContain('start_date=2026-01-01');
			expect(calledUrl).toContain('end_date=2026-01-31');
			expect(calledUrl).toContain('sort_by=created_at');
			expect(calledUrl).toContain('sort_order=desc');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=20');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchCorrelationCases } = await import('./correlation-client');

			await expect(fetchCorrelationCases({}, mockFetch)).rejects.toThrow('Failed to fetch cases: 500');
		});
	});

	describe('fetchCorrelationCase', () => {
		it('fetches from /api/governance/correlation/cases/:caseId', async () => {
			const data = { id: 'case-1', status: 'pending', confidence_score: 0.85 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchCorrelationCase } = await import('./correlation-client');

			const result = await fetchCorrelationCase('case-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/correlation/cases/case-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchCorrelationCase } = await import('./correlation-client');

			await expect(fetchCorrelationCase('bad', mockFetch)).rejects.toThrow('Failed to fetch case: 404');
		});
	});

	describe('confirmCaseClient', () => {
		it('sends POST to /api/governance/correlation/cases/:id/confirm', async () => {
			const body = { identity_id: 'user-1', notes: 'Verified match' };
			const data = { id: 'case-1', status: 'confirmed' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { confirmCaseClient } = await import('./correlation-client');

			const result = await confirmCaseClient('case-1', body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/correlation/cases/case-1/confirm', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { confirmCaseClient } = await import('./correlation-client');

			await expect(confirmCaseClient('case-1', {} as any, mockFetch)).rejects.toThrow('Failed to confirm case: 400');
		});
	});

	describe('rejectCaseClient', () => {
		it('sends POST to /api/governance/correlation/cases/:id/reject', async () => {
			const body = { reason: 'False positive' };
			const data = { id: 'case-1', status: 'rejected' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { rejectCaseClient } = await import('./correlation-client');

			const result = await rejectCaseClient('case-1', body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/correlation/cases/case-1/reject', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { rejectCaseClient } = await import('./correlation-client');

			await expect(rejectCaseClient('case-1', {} as any, mockFetch)).rejects.toThrow('Failed to reject case: 400');
		});
	});

	describe('createIdentityFromCaseClient', () => {
		it('sends POST to /api/governance/correlation/cases/:id/create-identity', async () => {
			const body = { display_name: 'New User', email: 'new@example.com' };
			const data = { id: 'case-1', status: 'confirmed', created_identity_id: 'user-new' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { createIdentityFromCaseClient } = await import('./correlation-client');

			const result = await createIdentityFromCaseClient('case-1', body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/correlation/cases/case-1/create-identity', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 422));
			const { createIdentityFromCaseClient } = await import('./correlation-client');

			await expect(createIdentityFromCaseClient('case-1', {} as any, mockFetch)).rejects.toThrow('Failed to create identity from case: 422');
		});
	});

	describe('reassignCaseClient', () => {
		it('sends POST to /api/governance/correlation/cases/:id/reassign', async () => {
			const body = { assigned_to: 'admin-2', reason: 'Escalation' };
			const data = { id: 'case-1', assigned_to: 'admin-2' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { reassignCaseClient } = await import('./correlation-client');

			const result = await reassignCaseClient('case-1', body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/correlation/cases/case-1/reassign', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 403));
			const { reassignCaseClient } = await import('./correlation-client');

			await expect(reassignCaseClient('case-1', {} as any, mockFetch)).rejects.toThrow('Failed to reassign case: 403');
		});
	});

	// --- Identity Correlation Rules (Global) ---

	describe('fetchIdentityCorrelationRules', () => {
		it('fetches from /api/governance/correlation/identity-rules', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchIdentityCorrelationRules } = await import('./correlation-client');

			const result = await fetchIdentityCorrelationRules({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/correlation/identity-rules');
			expect(result).toEqual(data);
		});

		it('includes query params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchIdentityCorrelationRules } = await import('./correlation-client');

			await fetchIdentityCorrelationRules({ match_type: 'fuzzy', is_active: true, attribute: 'email', limit: 10, offset: 5 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('match_type=fuzzy');
			expect(calledUrl).toContain('is_active=true');
			expect(calledUrl).toContain('attribute=email');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=5');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchIdentityCorrelationRules } = await import('./correlation-client');

			await expect(fetchIdentityCorrelationRules({}, mockFetch)).rejects.toThrow('Failed to fetch identity rules: 500');
		});
	});

	describe('createIdentityCorrelationRuleClient', () => {
		it('sends POST to /api/governance/correlation/identity-rules', async () => {
			const body = { name: 'Email match', match_type: 'exact', source_attribute: 'email', target_attribute: 'email' };
			const data = { id: 'rule-1', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { createIdentityCorrelationRuleClient } = await import('./correlation-client');

			const result = await createIdentityCorrelationRuleClient(body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/correlation/identity-rules', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createIdentityCorrelationRuleClient } = await import('./correlation-client');

			await expect(createIdentityCorrelationRuleClient({} as any, mockFetch)).rejects.toThrow('Failed to create identity rule: 400');
		});
	});

	describe('updateIdentityCorrelationRuleClient', () => {
		it('sends PUT to /api/governance/correlation/identity-rules/:ruleId', async () => {
			const body = { name: 'Updated rule', is_active: false };
			const data = { id: 'rule-1', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { updateIdentityCorrelationRuleClient } = await import('./correlation-client');

			const result = await updateIdentityCorrelationRuleClient('rule-1', body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/correlation/identity-rules/rule-1', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 422));
			const { updateIdentityCorrelationRuleClient } = await import('./correlation-client');

			await expect(updateIdentityCorrelationRuleClient('rule-1', {} as any, mockFetch)).rejects.toThrow('Failed to update identity rule: 422');
		});
	});

	describe('deleteIdentityCorrelationRuleClient', () => {
		it('sends DELETE to /api/governance/correlation/identity-rules/:ruleId', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { deleteIdentityCorrelationRuleClient } = await import('./correlation-client');

			await deleteIdentityCorrelationRuleClient('rule-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/correlation/identity-rules/rule-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { deleteIdentityCorrelationRuleClient } = await import('./correlation-client');

			await expect(deleteIdentityCorrelationRuleClient('bad', mockFetch)).rejects.toThrow('Failed to delete identity rule: 404');
		});
	});

	// --- Audit (Global) ---

	describe('fetchCorrelationAuditEvents', () => {
		it('fetches from /api/governance/correlation/audit', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchCorrelationAuditEvents } = await import('./correlation-client');

			const result = await fetchCorrelationAuditEvents({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/correlation/audit');
			expect(result).toEqual(data);
		});

		it('includes all query params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchCorrelationAuditEvents } = await import('./correlation-client');

			await fetchCorrelationAuditEvents({
				connector_id: 'conn-1',
				event_type: 'case_confirmed',
				outcome: 'success',
				start_date: '2026-01-01',
				end_date: '2026-01-31',
				actor_id: 'admin-1',
				limit: 10,
				offset: 20
			}, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('connector_id=conn-1');
			expect(calledUrl).toContain('event_type=case_confirmed');
			expect(calledUrl).toContain('outcome=success');
			expect(calledUrl).toContain('start_date=2026-01-01');
			expect(calledUrl).toContain('end_date=2026-01-31');
			expect(calledUrl).toContain('actor_id=admin-1');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=20');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchCorrelationAuditEvents } = await import('./correlation-client');

			await expect(fetchCorrelationAuditEvents({}, mockFetch)).rejects.toThrow('Failed to fetch audit events: 500');
		});
	});

	describe('fetchCorrelationAuditEvent', () => {
		it('fetches from /api/governance/correlation/audit/:eventId', async () => {
			const data = { id: 'evt-1', event_type: 'case_confirmed', actor_id: 'admin-1', created_at: '2026-01-15T10:00:00Z' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchCorrelationAuditEvent } = await import('./correlation-client');

			const result = await fetchCorrelationAuditEvent('evt-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/correlation/audit/evt-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchCorrelationAuditEvent } = await import('./correlation-client');

			await expect(fetchCorrelationAuditEvent('bad', mockFetch)).rejects.toThrow('Failed to fetch audit event: 404');
		});
	});
});
