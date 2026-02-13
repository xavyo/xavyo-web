import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('persona-context-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	// --- switchContextClient ---

	describe('switchContextClient', () => {
		it('sends POST to /api/personas/context/switch with body', async () => {
			const body = { persona_id: 'persona-1', reason: 'Testing context switch' };
			const data = { session_id: 'sess-1', persona_id: 'persona-1', switched_at: '2026-01-15' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { switchContextClient } = await import('./persona-context-client');

			const result = await switchContextClient(body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/personas/context/switch', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 403));
			const { switchContextClient } = await import('./persona-context-client');

			await expect(switchContextClient({} as any, mockFetch)).rejects.toThrow('Failed to switch context: 403');
		});
	});

	// --- switchBackClient ---

	describe('switchBackClient', () => {
		it('sends POST to /api/personas/context/switch-back with body', async () => {
			const body = { reason: 'Done testing' };
			const data = { session_id: 'sess-2', persona_id: null, switched_at: '2026-01-15' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { switchBackClient } = await import('./persona-context-client');

			const result = await switchBackClient(body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/personas/context/switch-back', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('sends with empty body by default', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ session_id: 'sess-2' }));
			const { switchBackClient } = await import('./persona-context-client');

			await switchBackClient(undefined, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/personas/context/switch-back', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({})
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { switchBackClient } = await import('./persona-context-client');

			await expect(switchBackClient({}, mockFetch)).rejects.toThrow('Failed to switch back: 400');
		});
	});

	// --- fetchCurrentContext ---

	describe('fetchCurrentContext', () => {
		it('fetches from /api/personas/context/current', async () => {
			const data = { user_id: 'user-1', active_persona_id: 'persona-1', persona_name: 'Admin' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchCurrentContext } = await import('./persona-context-client');

			const result = await fetchCurrentContext(mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/personas/context/current');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 401));
			const { fetchCurrentContext } = await import('./persona-context-client');

			await expect(fetchCurrentContext(mockFetch)).rejects.toThrow('Failed to fetch current context: 401');
		});
	});

	// --- fetchContextSessions ---

	describe('fetchContextSessions', () => {
		it('fetches from /api/personas/context/sessions without params', async () => {
			const data = { items: [{ id: 'sess-1' }], total: 1 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchContextSessions } = await import('./persona-context-client');

			const result = await fetchContextSessions({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/personas/context/sessions');
			expect(result).toEqual(data);
		});

		it('includes pagination params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchContextSessions } = await import('./persona-context-client');

			await fetchContextSessions({ limit: 25, offset: 50 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('limit=25');
			expect(calledUrl).toContain('offset=50');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchContextSessions } = await import('./persona-context-client');

			await expect(fetchContextSessions({}, mockFetch)).rejects.toThrow('Failed to fetch context sessions: 500');
		});
	});
});
