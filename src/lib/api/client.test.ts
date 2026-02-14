import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock $env/dynamic/private
vi.mock('$env/dynamic/private', () => ({
	env: { API_BASE_URL: 'http://localhost:8080' }
}));

import { apiClient, ApiError } from './client';

describe('ApiError', () => {
	it('stores status and message', () => {
		const error = new ApiError('Not found', 404);
		expect(error.message).toBe('Not found');
		expect(error.status).toBe(404);
		expect(error.errorType).toBe('');
	});

	it('stores errorType when provided', () => {
		const error = new ApiError('Forbidden', 403, 'https://xavyo.net/errors/email-not-verified');
		expect(error.errorType).toBe('https://xavyo.net/errors/email-not-verified');
		expect(error.status).toBe(403);
	});
});

describe('apiClient', () => {
	let mockFetch: ReturnType<typeof vi.fn> & typeof globalThis.fetch;

	beforeEach(() => {
		mockFetch = vi.fn() as any;
	});

	it('parses ProblemDetails error type from response', async () => {
		mockFetch.mockResolvedValue({
			ok: false,
			status: 403,
			text: () =>
				Promise.resolve(
					JSON.stringify({
						type: 'https://xavyo.net/errors/email-not-verified',
						title: 'Email Not Verified',
						status: 403,
						detail: 'Please verify your email address before proceeding.'
					})
				)
		});

		try {
			await apiClient('/auth/login', {
				method: 'POST',
				body: { email: 'a@b.com', password: 'x' },
				fetch: mockFetch
			});
			expect.unreachable('Should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(ApiError);
			const err = e as ApiError;
			expect(err.status).toBe(403);
			expect(err.message).toBe('Please verify your email address before proceeding.');
			expect(err.errorType).toBe('https://xavyo.net/errors/email-not-verified');
		}
	});

	it('handles non-JSON error responses gracefully', async () => {
		mockFetch.mockResolvedValue({
			ok: false,
			status: 500,
			text: () => Promise.resolve('Internal Server Error')
		});

		try {
			await apiClient('/test', { method: 'GET', fetch: mockFetch });
			expect.unreachable('Should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(ApiError);
			const err = e as ApiError;
			expect(err.status).toBe(500);
			expect(err.message).toBe('Internal Server Error');
			expect(err.errorType).toBe('');
		}
	});

	it('handles JSON error without type field', async () => {
		mockFetch.mockResolvedValue({
			ok: false,
			status: 400,
			text: () =>
				Promise.resolve(JSON.stringify({ detail: 'Bad request' }))
		});

		try {
			await apiClient('/test', { method: 'GET', fetch: mockFetch });
			expect.unreachable('Should have thrown');
		} catch (e) {
			const err = e as ApiError;
			expect(err.message).toBe('Bad request');
			expect(err.errorType).toBe('');
		}
	});

	it('returns parsed JSON on success', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			status: 200,
			text: () => Promise.resolve(JSON.stringify({ data: 'hello' }))
		});

		const result = await apiClient('/test', { method: 'GET', fetch: mockFetch });
		expect(result).toEqual({ data: 'hello' });
	});

	it('returns null for 204 responses', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			status: 204
		});

		const result = await apiClient('/test', { method: 'DELETE', fetch: mockFetch });
		expect(result).toBeNull();
	});
});
