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
import {
	switchContext,
	switchBack,
	getCurrentContext,
	listContextSessions
} from './persona-context';

const mockApiClient = vi.mocked(apiClient);

describe('Persona Context API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('switchContext', () => {
		it('calls POST /governance/context/switch with body', async () => {
			const body = { persona_id: 'persona-1', reason: 'Admin task' };
			const mockResult = { session_id: 'sess-1', persona_id: 'persona-1', switched_at: '2026-02-01' };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await switchContext(body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/context/switch', {
				method: 'POST', token, tenantId, body, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});
	});

	describe('switchBack', () => {
		it('calls POST /governance/context/switch-back with body', async () => {
			const body = { reason: 'Task complete' };
			const mockResult = { session_id: 'sess-1', switched_back_at: '2026-02-01' };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await switchBack(body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/context/switch-back', {
				method: 'POST', token, tenantId, body, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});

		it('calls POST /governance/context/switch-back with empty reason', async () => {
			const body = { reason: '' };
			mockApiClient.mockResolvedValue({});

			await switchBack(body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/context/switch-back', {
				method: 'POST', token, tenantId, body, fetch: mockFetch
			});
		});
	});

	describe('getCurrentContext', () => {
		it('calls GET /governance/context/current', async () => {
			const mockResult = { persona_id: 'persona-1', persona_name: 'Admin', active: true };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await getCurrentContext(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/context/current', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});
	});

	describe('listContextSessions', () => {
		it('calls GET /governance/context/sessions without params', async () => {
			const mockResult = { items: [], total: 0 };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await listContextSessions({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/context/sessions', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0 });

			await listContextSessions({ limit: 20, offset: 10 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/governance/context/sessions');
			expect(calledPath).toContain('limit=20');
			expect(calledPath).toContain('offset=10');
		});
	});
});
