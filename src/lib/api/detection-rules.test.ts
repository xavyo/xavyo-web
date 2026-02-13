import { describe, it, expect, vi, beforeEach } from 'vitest';

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

import {
	listDetectionRules,
	getDetectionRule,
	createDetectionRule,
	updateDetectionRule,
	deleteDetectionRule,
	enableDetectionRule,
	disableDetectionRule,
	seedDefaultRules
} from './detection-rules';

describe('detection-rules API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	const mockRule = {
		id: 'rule-1',
		name: 'No Manager Rule',
		rule_type: 'no_manager' as const,
		is_enabled: true,
		priority: 1,
		parameters: { threshold: 30 },
		description: 'Detect users without a manager',
		created_at: '2026-01-01T00:00:00Z',
		updated_at: '2026-01-01T00:00:00Z'
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- listDetectionRules ---

	describe('listDetectionRules', () => {
		it('calls GET /governance/detection-rules with no params', async () => {
			const mockResponse = { items: [mockRule], total: 1, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listDetectionRules({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/detection-rules', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes rule_type query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listDetectionRules({ rule_type: 'no_manager' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('rule_type=no_manager');
		});

		it('includes is_enabled query param as string', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listDetectionRules({ is_enabled: true }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('is_enabled=true');
		});

		it('includes is_enabled=false query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listDetectionRules({ is_enabled: false }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('is_enabled=false');
		});

		it('includes limit and offset query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listDetectionRules({ limit: 10, offset: 20 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=10');
			expect(calledPath).toContain('offset=20');
		});

		it('includes all query params together', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listDetectionRules(
				{ rule_type: 'inactive', is_enabled: true, limit: 5, offset: 0 },
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('rule_type=inactive');
			expect(calledPath).toContain('is_enabled=true');
			expect(calledPath).toContain('limit=5');
			expect(calledPath).toContain('offset=0');
		});
	});

	// --- getDetectionRule ---

	describe('getDetectionRule', () => {
		it('calls GET /governance/detection-rules/:id', async () => {
			mockApiClient.mockResolvedValue(mockRule);

			const result = await getDetectionRule('rule-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/detection-rules/rule-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockRule);
		});
	});

	// --- createDetectionRule ---

	describe('createDetectionRule', () => {
		it('calls POST /governance/detection-rules with body', async () => {
			const body = {
				name: 'No Manager Rule',
				rule_type: 'no_manager' as const,
				is_enabled: true,
				priority: 1,
				parameters: { threshold: 30 },
				description: 'Detect users without a manager'
			};
			mockApiClient.mockResolvedValue(mockRule);

			const result = await createDetectionRule(body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/detection-rules', {
				method: 'POST',
				body,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockRule);
		});

		it('sends body without optional fields', async () => {
			const body = {
				name: 'Terminated Rule',
				rule_type: 'terminated' as const,
				is_enabled: false,
				priority: 2
			};
			mockApiClient.mockResolvedValue(mockRule);

			await createDetectionRule(body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/detection-rules', {
				method: 'POST',
				body,
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	// --- updateDetectionRule ---

	describe('updateDetectionRule', () => {
		it('calls PUT /governance/detection-rules/:id with body', async () => {
			const body = {
				name: 'Updated Rule',
				priority: 5,
				description: 'Updated description'
			};
			mockApiClient.mockResolvedValue({ ...mockRule, ...body });

			const result = await updateDetectionRule('rule-1', body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/detection-rules/rule-1', {
				method: 'PUT',
				body,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual({ ...mockRule, ...body });
		});

		it('sends partial body', async () => {
			const body = { is_enabled: false };
			mockApiClient.mockResolvedValue({ ...mockRule, is_enabled: false });

			await updateDetectionRule('rule-1', body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/detection-rules/rule-1', {
				method: 'PUT',
				body,
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	// --- deleteDetectionRule ---

	describe('deleteDetectionRule', () => {
		it('calls DELETE /governance/detection-rules/:id and returns void', async () => {
			mockApiClient.mockResolvedValue(undefined);

			const result = await deleteDetectionRule('rule-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/detection-rules/rule-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toBeUndefined();
		});
	});

	// --- enableDetectionRule ---

	describe('enableDetectionRule', () => {
		it('calls POST /governance/detection-rules/:id/enable', async () => {
			const enabledRule = { ...mockRule, is_enabled: true };
			mockApiClient.mockResolvedValue(enabledRule);

			const result = await enableDetectionRule('rule-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/detection-rules/rule-1/enable', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(enabledRule);
		});
	});

	// --- disableDetectionRule ---

	describe('disableDetectionRule', () => {
		it('calls POST /governance/detection-rules/:id/disable', async () => {
			const disabledRule = { ...mockRule, is_enabled: false };
			mockApiClient.mockResolvedValue(disabledRule);

			const result = await disableDetectionRule('rule-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/detection-rules/rule-1/disable',
				{
					method: 'POST',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(disabledRule);
		});
	});

	// --- seedDefaultRules ---

	describe('seedDefaultRules', () => {
		it('calls POST /governance/detection-rules/seed-defaults and returns DetectionRule[]', async () => {
			const seededRules = [
				mockRule,
				{ ...mockRule, id: 'rule-2', name: 'Terminated Rule', rule_type: 'terminated' as const }
			];
			mockApiClient.mockResolvedValue(seededRules);

			const result = await seedDefaultRules(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/detection-rules/seed-defaults', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(seededRules);
			expect(result).toHaveLength(2);
		});
	});
});
