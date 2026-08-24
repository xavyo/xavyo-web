import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$app/environment', () => ({
	dev: false,
	browser: false
}));

vi.mock('$env/dynamic/private', () => ({
	env: { APP_VERSION: 'test' }
}));

vi.mock('$lib/api/alerts', () => ({
	fetchAlerts: vi.fn()
}));

vi.mock('$lib/api/power-of-attorney', () => ({
	getCurrentAssumption: vi.fn()
}));

vi.mock('$lib/api/persona-context', () => ({
	getCurrentContext: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

import { load } from './+layout.server';
import { fetchAlerts } from '$lib/api/alerts';
import { getCurrentAssumption } from '$lib/api/power-of-attorney';
import { getCurrentContext } from '$lib/api/persona-context';
import { ApiError } from '$lib/api/client';

const tenantId = '11111111-1111-1111-1111-111111111111';

describe('App layout +layout.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(fetchAlerts).mockResolvedValue({ unacknowledged_count: 2 } as any);
		vi.mocked(getCurrentAssumption).mockResolvedValue({ is_assuming: false } as any);
		vi.mocked(getCurrentContext).mockResolvedValue({ is_persona_active: false } as any);
	});

	it('redirects unauthenticated users to login', async () => {
		try {
			await load({
				locals: { user: null },
				url: new URL('http://localhost/dashboard'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(302);
			expect(e.location).toContain('/login');
		}
	});

	it('returns session context for authenticated users', async () => {
		const result = (await load({
			locals: {
				user: { id: 'u1', roles: ['admin'] },
				accessToken: 'tok',
				tenantId
			},
			url: new URL('http://localhost/dashboard'),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.unacknowledgedAlertCount).toBe(2);
		expect(result.currentAssumption.is_assuming).toBe(false);
		expect(result.personaContext.is_persona_active).toBe(false);
		expect(result.isAdmin).toBe(true);
	});

	it('fails closed when assumption API throws', async () => {
		vi.mocked(getCurrentAssumption).mockRejectedValue(new Error('network'));

		try {
			await load({
				locals: {
					user: { id: 'u1', roles: ['user'] },
					accessToken: 'tok',
					tenantId
				},
				url: new URL('http://localhost/dashboard'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('fails closed when persona context API throws', async () => {
		vi.mocked(getCurrentContext).mockRejectedValue(new Error('network'));

		try {
			await load({
				locals: {
					user: { id: 'u1', roles: ['user'] },
					accessToken: 'tok',
					tenantId
				},
				url: new URL('http://localhost/dashboard'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('propagates ApiError status from alerts', async () => {
		vi.mocked(fetchAlerts).mockRejectedValue(new ApiError('Forbidden', 403));

		try {
			await load({
				locals: {
					user: { id: 'u1', roles: ['user'] },
					accessToken: 'tok',
					tenantId
				},
				url: new URL('http://localhost/dashboard'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(403);
		}
	});
});
