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
	listExpiringPersonas,
	extendPersona,
	propagateAttributes
} from './persona-expiry';

const mockApiClient = vi.mocked(apiClient);

describe('Persona Expiry API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listExpiringPersonas', () => {
		it('calls GET /governance/personas/expiring without params', async () => {
			const mockResult = { items: [], total: 0 };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await listExpiringPersonas({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/personas/expiring', {
				method: 'GET', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});

		it('includes days_ahead and pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0 });

			await listExpiringPersonas({ days_ahead: 30, limit: 20, offset: 0 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/governance/personas/expiring');
			expect(calledPath).toContain('days_ahead=30');
			expect(calledPath).toContain('limit=20');
			expect(calledPath).toContain('offset=0');
		});
	});

	describe('extendPersona', () => {
		it('calls POST /governance/personas/:id/extend with body', async () => {
			const body = { new_valid_until: '2026-12-31', reason: 'Project extended' };
			const mockResult = { persona_id: 'persona-1', new_valid_until: '2026-12-31' };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await extendPersona('persona-1', body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/personas/persona-1/extend', {
				method: 'POST', token, tenantId, body, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});
	});

	describe('propagateAttributes', () => {
		it('calls POST /governance/personas/:id/propagate-attributes', async () => {
			const mockResult = { persona_id: 'persona-1', attributes_propagated: 5 };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await propagateAttributes('persona-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/personas/persona-1/propagate-attributes', {
				method: 'POST', token, tenantId, fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});
	});
});
