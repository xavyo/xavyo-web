import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/auth', () => ({
	logout: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('$lib/api/federation', () => ({
	initiateSamlSlo: vi.fn().mockResolvedValue({ initiated: 0 })
}));

import { load, actions } from './+page.server';
import { logout } from '$lib/api/auth';
import { initiateSamlSlo } from '$lib/api/federation';

function makeCookies(values: Record<string, string> = {}) {
	return {
		get: vi.fn((name: string) => values[name]),
		set: vi.fn(),
		delete: vi.fn()
	};
}

describe('logout +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load', () => {
		it('does not delete auth cookies on GET', async () => {
			const cookies = makeCookies({
				access_token: 'at-123',
				refresh_token: 'rt-456',
				tenant_id: 'tid-1'
			});

			const result = await load({
				cookies,
				url: new URL('http://localhost/logout'),
				fetch: vi.fn()
			} as never);

			expect(result).toEqual({ full: false });
			expect(cookies.delete).not.toHaveBeenCalled();
			expect(cookies.delete).not.toHaveBeenCalledWith('access_token', expect.anything());
		});

		it('returns full=true from the query string without clearing the session', async () => {
			const cookies = makeCookies({ access_token: 'at-123' });

			const result = await load({
				cookies,
				url: new URL('http://localhost/logout?full=true'),
				fetch: vi.fn()
			} as never);

			expect(result).toEqual({ full: true });
			expect(cookies.delete).not.toHaveBeenCalled();
		});
	});

	describe('actions', () => {
		it('exports a POST-only default action', () => {
			expect(actions).toBeDefined();
			expect(typeof actions.default).toBe('function');
		});

		it('clears auth cookies on POST', async () => {
			const cookies = makeCookies({
				access_token: 'at-123',
				refresh_token: 'rt-456',
				tenant_id: 'tid-1'
			});
			const request = new Request('http://localhost/logout', {
				method: 'POST',
				body: new FormData()
			});

			try {
				await (actions.default as (event: unknown) => Promise<unknown>)({
					cookies,
					fetch: vi.fn(),
					request
				});
				expect.fail('should have thrown redirect');
			} catch (e: unknown) {
				expect(e).toMatchObject({ status: 302, location: '/login' });
			}

			expect(logout).toHaveBeenCalled();
			expect(initiateSamlSlo).toHaveBeenCalled();
			expect(cookies.delete).toHaveBeenCalledWith('access_token', { path: '/' });
			expect(cookies.delete).toHaveBeenCalledWith('refresh_token', { path: '/' });
			expect(cookies.delete).toHaveBeenCalledWith('original_access_token', { path: '/' });
		});
	});
});
