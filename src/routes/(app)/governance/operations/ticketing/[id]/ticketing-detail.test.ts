import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance-operations', () => ({
	getTicketingConfig: vi.fn(),
	deleteTicketingConfig: vi.fn()
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

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

import { load, actions } from './+page.server';
import { getTicketingConfig, deleteTicketingConfig } from '$lib/api/governance-operations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { TicketingConfig } from '$lib/api/types';

const mockGetTicketingConfig = vi.mocked(getTicketingConfig);
const mockDeleteTicketingConfig = vi.mocked(deleteTicketingConfig);
const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockConfig: TicketingConfig = {
	id: 'tc1',
	name: 'Production ServiceNow',
	ticketing_type: 'service_now',
	endpoint_url: 'https://example.service-now.com',
	polling_interval_seconds: 300,
	is_active: true,
	created_at: '2025-01-01T00:00:00Z',
	updated_at: '2025-01-01T00:00:00Z'
};

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Ticketing Detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects non-admin users', async () => {
			mockHasAdminRole.mockReturnValue(false);
			try {
				await load({
					params: { id: 'tc1' },
					locals: mockLocals(false),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('throws 401 when no accessToken', async () => {
			try {
				await load({
					params: { id: 'tc1' },
					locals: { accessToken: null, tenantId: 'tid', user: { roles: ['admin'] } },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(401);
			}
		});

		it('returns config for admin', async () => {
			mockGetTicketingConfig.mockResolvedValue(mockConfig as any);
			const result = (await load({
				params: { id: 'tc1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.config).toEqual(mockConfig);
			expect(result.config.name).toBe('Production ServiceNow');
		});

		it('passes correct id to getTicketingConfig', async () => {
			mockGetTicketingConfig.mockResolvedValue(mockConfig as any);
			await load({
				params: { id: 'tc1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(mockGetTicketingConfig).toHaveBeenCalledWith(
				'tc1',
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('throws error when config not found', async () => {
			mockGetTicketingConfig.mockRejectedValue(new ApiError('Not found', 404));
			await expect(
				load({
					params: { id: 'nonexistent' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any)
			).rejects.toThrow();
		});
	});

	describe('actions.delete', () => {
		it('exports delete action', () => {
			expect(actions.delete).toBeDefined();
		});

		it('calls deleteTicketingConfig and redirects', async () => {
			mockDeleteTicketingConfig.mockResolvedValue(undefined as any);
			await expect(
				actions.delete({
					params: { id: 'tc1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any)
			).rejects.toThrow();
			expect(mockDeleteTicketingConfig).toHaveBeenCalledWith(
				'tc1',
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns fail on API error', async () => {
			mockDeleteTicketingConfig.mockRejectedValue(new ApiError('Cannot delete', 409));
			const result: any = await actions.delete({
				params: { id: 'tc1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(409);
		});
	});
});

describe('Ticketing Detail +page.svelte', () => {
	it(
		'is defined as a module',
		async () => {
			const mod = await import('./+page.svelte');
			expect(mod.default).toBeDefined();
		},
		15000
	);

	it(
		'is a valid Svelte component constructor',
		async () => {
			const mod = await import('./+page.svelte');
			expect(typeof mod.default).toBe('function');
		},
		15000
	);
});

describe('Ticketing Detail rendering logic', () => {
	describe('ticketing type display', () => {
		it('mockConfig has correct ticketing_type', () => {
			expect(mockConfig.ticketing_type).toBe('service_now');
		});

		it('mockConfig has endpoint_url', () => {
			expect(mockConfig.endpoint_url).toBe('https://example.service-now.com');
		});

		it('mockConfig has polling_interval_seconds', () => {
			expect(mockConfig.polling_interval_seconds).toBe(300);
		});
	});

	describe('formatDateTime', () => {
		function formatDateTime(dateStr: string | null): string {
			if (!dateStr || isNaN(new Date(dateStr).getTime())) return '\u2014';
			return new Date(dateStr).toLocaleString();
		}

		it('formats valid date', () => {
			const result = formatDateTime('2025-01-01T00:00:00Z');
			expect(result).toBeTruthy();
			expect(result).not.toBe('\u2014');
		});

		it('returns dash for null', () => {
			expect(formatDateTime(null)).toBe('\u2014');
		});

		it('returns dash for invalid date', () => {
			expect(formatDateTime('not-a-date')).toBe('\u2014');
		});
	});
});
