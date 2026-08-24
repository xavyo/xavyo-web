import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/branding', () => ({
	getBranding: vi.fn(),
	updateBranding: vi.fn()
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

import { load } from './+page.server';
import { getBranding } from '$lib/api/branding';
import { ApiError } from '$lib/api/client';

const mockLocals = () => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: ['admin'] }
});

describe('Branding settings +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns branding when configured', async () => {
		vi.mocked(getBranding).mockResolvedValue({ primary_color: '#111' } as any);

		const result = (await load({
			locals: mockLocals(),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.form.data.primary_color).toBe('#111');
	});

	it('falls back to empty form on 404', async () => {
		vi.mocked(getBranding).mockRejectedValue(new ApiError('Not found', 404));

		const result = (await load({
			locals: mockLocals(),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.form).toBeDefined();
		expect(result.form.data.primary_color).toBe('');
	});

	it('fails closed on 500', async () => {
		vi.mocked(getBranding).mockRejectedValue(new ApiError('boom', 500));

		try {
			await load({
				locals: mockLocals(),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});
});
