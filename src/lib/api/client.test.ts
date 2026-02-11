import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient, ApiError } from './client';

const MOCK_BASE_URL = 'http://localhost:8080';

describe('apiClient', () => {
	beforeEach(() => {
		vi.stubEnv('API_BASE_URL', MOCK_BASE_URL);
		vi.restoreAllMocks();
	});

	it('constructs correct URL from API_BASE_URL and endpoint', async () => {
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ ok: true }), { status: 200 })
		);

		await apiClient('/auth/login', { method: 'POST', body: {}, fetch: mockFetch });

		expect(mockFetch).toHaveBeenCalledWith(
			`${MOCK_BASE_URL}/auth/login`,
			expect.any(Object)
		);
	});

	it('sends Content-Type application/json header', async () => {
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({}), { status: 200 })
		);

		await apiClient('/test', { method: 'POST', body: {}, fetch: mockFetch });

		const callArgs = mockFetch.mock.calls[0][1];
		expect(callArgs.headers.get('Content-Type')).toBe('application/json');
	});

	it('sends Authorization Bearer header when token provided', async () => {
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({}), { status: 200 })
		);

		await apiClient('/test', {
			method: 'GET',
			fetch: mockFetch,
			token: 'my-jwt-token'
		});

		const callArgs = mockFetch.mock.calls[0][1];
		expect(callArgs.headers.get('Authorization')).toBe('Bearer my-jwt-token');
	});

	it('sends X-Tenant-Id header when tenantId provided', async () => {
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({}), { status: 200 })
		);

		await apiClient('/test', {
			method: 'GET',
			fetch: mockFetch,
			tenantId: 'tenant-123'
		});

		const callArgs = mockFetch.mock.calls[0][1];
		expect(callArgs.headers.get('X-Tenant-Id')).toBe('tenant-123');
	});

	it('does not send Authorization header when no token', async () => {
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({}), { status: 200 })
		);

		await apiClient('/test', { method: 'GET', fetch: mockFetch });

		const callArgs = mockFetch.mock.calls[0][1];
		expect(callArgs.headers.has('Authorization')).toBe(false);
	});

	it('parses JSON response correctly', async () => {
		const mockData = { access_token: 'token123', token_type: 'Bearer' };
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(mockData), { status: 200 })
		);

		const result = await apiClient('/test', { method: 'GET', fetch: mockFetch });
		expect(result).toEqual(mockData);
	});

	it('throws ApiError on 4xx responses with correct status and message', async () => {
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 })
		);

		try {
			await apiClient('/test', { method: 'GET', fetch: mockFetch });
			expect.unreachable('Should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(ApiError);
			expect((e as ApiError).status).toBe(401);
			expect((e as ApiError).message).toBe('Invalid credentials');
		}
	});

	it('throws ApiError on 5xx responses', async () => {
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
		);

		await expect(
			apiClient('/test', { method: 'GET', fetch: mockFetch })
		).rejects.toThrow(ApiError);
	});

	it('throws on network errors', async () => {
		const mockFetch = vi.fn().mockRejectedValue(new TypeError('fetch failed'));

		await expect(
			apiClient('/test', { method: 'GET', fetch: mockFetch })
		).rejects.toThrow();
	});

	it('sends JSON body for POST requests', async () => {
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({}), { status: 200 })
		);

		const body = { email: 'test@example.com', password: 'pass123' };
		await apiClient('/auth/login', { method: 'POST', body, fetch: mockFetch });

		const callArgs = mockFetch.mock.calls[0][1];
		expect(callArgs.body).toBe(JSON.stringify(body));
	});

	it('returns null for 204 No Content responses', async () => {
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(null, { status: 204 })
		);

		const result = await apiClient('/auth/logout', { method: 'POST', body: {}, fetch: mockFetch });
		expect(result).toBeNull();
	});
});
