import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('persona-expiry-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	// --- fetchExpiringPersonas ---

	describe('fetchExpiringPersonas', () => {
		it('fetches from /api/personas/expiring without params', async () => {
			const data = { items: [], total: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchExpiringPersonas } = await import('./persona-expiry-client');

			const result = await fetchExpiringPersonas({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/personas/expiring');
			expect(result).toEqual(data);
		});

		it('includes days_ahead and pagination params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchExpiringPersonas } = await import('./persona-expiry-client');

			await fetchExpiringPersonas({ days_ahead: 30, limit: 10, offset: 0 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('days_ahead=30');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=0');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchExpiringPersonas } = await import('./persona-expiry-client');

			await expect(fetchExpiringPersonas({}, mockFetch)).rejects.toThrow('Failed to fetch expiring personas: 500');
		});
	});

	// --- extendPersonaClient ---

	describe('extendPersonaClient', () => {
		it('sends POST to /api/personas/:id/extend with body', async () => {
			const body = { new_expiry_date: '2026-06-01', reason: 'Project extended' };
			const data = { persona_id: 'persona-1', new_expiry_date: '2026-06-01' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { extendPersonaClient } = await import('./persona-expiry-client');

			const result = await extendPersonaClient('persona-1', body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/personas/persona-1/extend', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { extendPersonaClient } = await import('./persona-expiry-client');

			await expect(extendPersonaClient('persona-1', {} as any, mockFetch)).rejects.toThrow('Failed to extend persona: 400');
		});
	});

	// --- propagateAttributesClient ---

	describe('propagateAttributesClient', () => {
		it('sends POST to /api/personas/:id/propagate', async () => {
			const data = { persona_id: 'persona-1', propagated_attributes: ['email', 'role'], updated_count: 3 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { propagateAttributesClient } = await import('./persona-expiry-client');

			const result = await propagateAttributesClient('persona-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/personas/persona-1/propagate', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { propagateAttributesClient } = await import('./persona-expiry-client');

			await expect(propagateAttributesClient('bad-id', mockFetch)).rejects.toThrow('Failed to propagate attributes: 404');
		});
	});
});
