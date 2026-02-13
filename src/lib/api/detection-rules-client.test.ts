import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	fetchDetectionRules,
	createDetectionRuleClient,
	deleteDetectionRuleClient,
	enableDetectionRuleClient,
	disableDetectionRuleClient,
	seedDefaultRulesClient
} from './detection-rules-client';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('detection-rules-client API', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- fetchDetectionRules ---

	describe('fetchDetectionRules', () => {
		it('fetches from /api/governance/detection-rules with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));

			const result = await fetchDetectionRules({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/detection-rules');
			expect(result).toEqual(data);
		});

		it('includes rule_type query param', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));

			await fetchDetectionRules({ rule_type: 'custom' }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('rule_type=custom');
		});

		it('includes is_enabled as boolean string', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));

			await fetchDetectionRules({ is_enabled: true }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('is_enabled=true');
		});

		it('includes is_enabled=false when false', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));

			await fetchDetectionRules({ is_enabled: false }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('is_enabled=false');
		});

		it('includes limit and offset query params', async () => {
			const data = { items: [], total: 0, limit: 10, offset: 20 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));

			await fetchDetectionRules({ limit: 10, offset: 20 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=20');
		});

		it('includes all query params together', async () => {
			const data = { items: [], total: 0, limit: 10, offset: 5 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));

			await fetchDetectionRules(
				{ rule_type: 'inactive', is_enabled: true, limit: 10, offset: 5 },
				mockFetch
			);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('rule_type=inactive');
			expect(calledUrl).toContain('is_enabled=true');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=5');
		});

		it('omits undefined params from query string', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));

			await fetchDetectionRules({ rule_type: undefined, limit: 20 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).not.toContain('rule_type');
			expect(calledUrl).toContain('limit=20');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));

			await expect(fetchDetectionRules({}, mockFetch)).rejects.toThrow(
				'Failed to fetch detection rules: 500'
			);
		});
	});

	// --- createDetectionRuleClient ---

	describe('createDetectionRuleClient', () => {
		it('sends POST to /api/governance/detection-rules with JSON body', async () => {
			const body = {
				name: 'No Manager Rule',
				rule_type: 'no_manager' as const,
				is_enabled: true,
				priority: 1,
				parameters: { threshold: 30 },
				description: 'Detect users without a manager'
			};
			const data = { id: 'rule-1', ...body, created_at: '2026-01-01', updated_at: '2026-01-01' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));

			const result = await createDetectionRuleClient(body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/detection-rules', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('sends POST without optional fields', async () => {
			const body = {
				name: 'Terminated Rule',
				rule_type: 'terminated' as const,
				is_enabled: false,
				priority: 2
			};
			const data = {
				id: 'rule-2',
				...body,
				parameters: {},
				description: null,
				created_at: '2026-01-01',
				updated_at: '2026-01-01'
			};
			mockFetch.mockResolvedValueOnce(mockResponse(data));

			const result = await createDetectionRuleClient(body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/detection-rules', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			const body = {
				name: 'Bad Rule',
				rule_type: 'custom' as const,
				is_enabled: true,
				priority: 1
			};
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));

			await expect(createDetectionRuleClient(body, mockFetch)).rejects.toThrow(
				'Failed to create detection rule: 400'
			);
		});
	});

	// --- deleteDetectionRuleClient ---

	describe('deleteDetectionRuleClient', () => {
		it('sends DELETE to /api/governance/detection-rules/:id', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null));

			await deleteDetectionRuleClient('rule-123', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/detection-rules/rule-123', {
				method: 'DELETE'
			});
		});

		it('returns void on success', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null));

			const result = await deleteDetectionRuleClient('rule-123', mockFetch);

			expect(result).toBeUndefined();
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));

			await expect(deleteDetectionRuleClient('bad-id', mockFetch)).rejects.toThrow(
				'Failed to delete detection rule: 404'
			);
		});
	});

	// --- enableDetectionRuleClient ---

	describe('enableDetectionRuleClient', () => {
		it('sends POST to /api/governance/detection-rules/:id/enable', async () => {
			const data = {
				id: 'rule-1',
				name: 'Test',
				rule_type: 'custom',
				is_enabled: true,
				priority: 1,
				parameters: {},
				description: null,
				created_at: '2026-01-01',
				updated_at: '2026-01-02'
			};
			mockFetch.mockResolvedValueOnce(mockResponse(data));

			const result = await enableDetectionRuleClient('rule-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/detection-rules/rule-1/enable', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));

			await expect(enableDetectionRuleClient('rule-1', mockFetch)).rejects.toThrow(
				'Failed to enable detection rule: 500'
			);
		});
	});

	// --- disableDetectionRuleClient ---

	describe('disableDetectionRuleClient', () => {
		it('sends POST to /api/governance/detection-rules/:id/disable', async () => {
			const data = {
				id: 'rule-2',
				name: 'Test',
				rule_type: 'inactive',
				is_enabled: false,
				priority: 3,
				parameters: {},
				description: 'Disabled rule',
				created_at: '2026-01-01',
				updated_at: '2026-01-02'
			};
			mockFetch.mockResolvedValueOnce(mockResponse(data));

			const result = await disableDetectionRuleClient('rule-2', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/detection-rules/rule-2/disable', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 403));

			await expect(disableDetectionRuleClient('rule-2', mockFetch)).rejects.toThrow(
				'Failed to disable detection rule: 403'
			);
		});
	});

	// --- seedDefaultRulesClient ---

	describe('seedDefaultRulesClient', () => {
		it('sends POST to /api/governance/detection-rules/seed-defaults', async () => {
			const data = [
				{
					id: 'rule-a',
					name: 'No Manager',
					rule_type: 'no_manager',
					is_enabled: true,
					priority: 1,
					parameters: {},
					description: 'Default no manager rule',
					created_at: '2026-01-01',
					updated_at: '2026-01-01'
				},
				{
					id: 'rule-b',
					name: 'terminated',
					rule_type: 'terminated',
					is_enabled: true,
					priority: 2,
					parameters: {},
					description: 'Default terminated rule',
					created_at: '2026-01-01',
					updated_at: '2026-01-01'
				}
			];
			mockFetch.mockResolvedValueOnce(mockResponse(data));

			const result = await seedDefaultRulesClient(mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/detection-rules/seed-defaults', {
				method: 'POST'
			});
			expect(result).toEqual(data);
			expect(result).toHaveLength(2);
		});

		it('returns DetectionRule[] on success', async () => {
			const data = [
				{
					id: 'rule-x',
					name: 'inactive',
					rule_type: 'inactive',
					is_enabled: true,
					priority: 3,
					parameters: { days: 90 },
					description: null,
					created_at: '2026-01-01',
					updated_at: '2026-01-01'
				}
			];
			mockFetch.mockResolvedValueOnce(mockResponse(data));

			const result = await seedDefaultRulesClient(mockFetch);

			expect(Array.isArray(result)).toBe(true);
			expect(result[0].id).toBe('rule-x');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));

			await expect(seedDefaultRulesClient(mockFetch)).rejects.toThrow(
				'Failed to seed default rules: 500'
			);
		});
	});
});
